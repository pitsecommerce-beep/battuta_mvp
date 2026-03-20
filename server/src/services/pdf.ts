import PDFDocument from 'pdfkit';
import { Quotation, QuotationItem, Product, Contact, Tenant } from '@prisma/client';

interface QuotationWithRelations extends Quotation {
  items: (QuotationItem & { product: Product })[];
  contact: Contact;
  tenant: Tenant;
}

export function generateQuotationPDF(quotation: QuotationWithRelations): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text(quotation.tenant.name, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text('COTIZACIÓN', { align: 'center' });
    doc.moveDown();

    // Info
    doc.fontSize(10);
    doc.text(`Cotización #: ${quotation.id.slice(0, 8).toUpperCase()}`);
    doc.text(`Fecha: ${quotation.createdAt.toLocaleDateString('es-MX')}`);
    doc.text(`Cliente: ${quotation.contact.name || quotation.contact.whatsappNumber}`);
    doc.text(`WhatsApp: ${quotation.contact.whatsappNumber}`);
    if (quotation.contact.email) {
      doc.text(`Email: ${quotation.contact.email}`);
    }
    doc.moveDown();

    // Table header
    doc.font('Helvetica-Bold');
    const tableTop = doc.y;
    doc.text('Producto', 50, tableTop, { width: 200 });
    doc.text('Cant.', 260, tableTop, { width: 50, align: 'center' });
    doc.text('P. Unit.', 320, tableTop, { width: 80, align: 'right' });
    doc.text('Subtotal', 410, tableTop, { width: 80, align: 'right' });
    doc.moveDown(0.5);

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(490, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // Items
    doc.font('Helvetica');
    for (const item of quotation.items) {
      const y = doc.y;
      doc.text(item.product.name, 50, y, { width: 200 });
      doc.text(String(item.quantity), 260, y, { width: 50, align: 'center' });
      doc.text(`$${item.unitPrice.toFixed(2)}`, 320, y, { width: 80, align: 'right' });
      doc.text(`$${item.subtotal.toFixed(2)}`, 410, y, { width: 80, align: 'right' });
      doc.moveDown();
    }

    // Total
    doc.moveDown();
    doc
      .moveTo(50, doc.y)
      .lineTo(490, doc.y)
      .stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold');
    doc.text(`TOTAL: $${quotation.total.toFixed(2)}`, { align: 'right' });

    // Footer
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(8);
    doc.text('Esta cotización es válida por 15 días a partir de la fecha de emisión.', {
      align: 'center',
    });

    doc.end();
  });
}
