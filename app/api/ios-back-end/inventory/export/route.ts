import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import * as XLSX from 'xlsx';

// GET - Export products data as Excel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get('salonId');

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID is required' }, { status: 400 });
    }

    // Verify the salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }

    // Fetch all active products
    const products = await prisma.product.findMany({
      where: {
        salonId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    // Calculate status for each product
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const productsWithStatus = products.map(product => {
      const isExpired = product.isExpired || (product.expirationDate && new Date(product.expirationDate) < now);
      const isExpiring = product.expirationDate &&
        new Date(product.expirationDate) >= now &&
        new Date(product.expirationDate) <= thirtyDaysFromNow;

      let status: 'OK' | 'Low' | 'Critical' | 'Expired' = 'OK';
      if (isExpired) {
        status = 'Expired';
      } else if (product.currentStock <= product.criticalPoint) {
        status = 'Critical';
      } else if (product.currentStock <= product.reorderPoint) {
        status = 'Low';
      }

      return {
        'Product Name': product.name,
        'SKU / Code': product.sku || '',
        'Category': product.category?.name || 'Uncategorized',
        'Current Stock': product.currentStock,
        'Reorder Point': product.reorderPoint,
        'Critical Point': product.criticalPoint,
        'Unit Cost ($)': product.unitCost ?? '',
        'Supplier': product.supplier || '',
        'Expiration Date': product.expirationDate
          ? new Date(product.expirationDate).toISOString().split('T')[0]
          : '',
        'Status': status,
        'Expiring Soon': isExpiring ? 'Yes' : 'No',
      };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(productsWithStatus);

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 25 }, // Product Name
      { wch: 15 }, // SKU / Code
      { wch: 18 }, // Category
      { wch: 14 }, // Current Stock
      { wch: 14 }, // Reorder Point
      { wch: 14 }, // Critical Point
      { wch: 12 }, // Unit Cost
      { wch: 20 }, // Supplier
      { wch: 15 }, // Expiration Date
      { wch: 10 }, // Status
      { wch: 14 }, // Expiring Soon
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

    // Add a summary sheet
    const summaryData = [
      { 'Field': 'Salon Name', 'Value': salon.businessName },
      { 'Field': 'Export Date', 'Value': new Date().toISOString().split('T')[0] },
      { 'Field': 'Total Products', 'Value': productsWithStatus.length },
      { 'Field': 'OK Status', 'Value': productsWithStatus.filter(p => p['Status'] === 'OK').length },
      { 'Field': 'Low Stock', 'Value': productsWithStatus.filter(p => p['Status'] === 'Low').length },
      { 'Field': 'Critical Stock', 'Value': productsWithStatus.filter(p => p['Status'] === 'Critical').length },
      { 'Field': 'Expired', 'Value': productsWithStatus.filter(p => p['Status'] === 'Expired').length },
      { 'Field': 'Expiring Soon', 'Value': productsWithStatus.filter(p => p['Expiring Soon'] === 'Yes').length },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 18 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return Excel file with appropriate headers
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="inventory_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
