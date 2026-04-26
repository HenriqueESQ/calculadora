// PDF Generator using jsPDF
// Requires: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

function generatePDF(type, data, user) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    
    // Header
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Goiás PVC', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Calculadora de Materiais', pageWidth / 2, 28, { align: 'center' });
    
    y = 55;
    
    // User info
    if (user) {
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Cliente:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(user.name, 45, y);
        
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Usuário:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text('@' + user.username, 45, y);
        
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Data:', 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date().toLocaleDateString('pt-BR'), 45, y);
        
        y += 15;
    }
    
    // Type title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 165, 233);
    
    const titles = {
        forro: 'Forro PVC',
        drywall: 'Drywall',
        naval: 'Divisória Naval'
    };
    doc.text(titles[type] || 'Cálculo', pageWidth / 2, y, { align: 'center' });
    
    y += 15;
    
    // Results table
    doc.setFillColor(241, 245, 249);
    doc.rect(20, y, pageWidth - 40, 10, 'F');
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 25, y + 7);
    doc.text('Valor', 150, y + 7);
    
    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Add data rows
    Object.entries(data).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        doc.setTextColor(100, 116, 139);
        doc.text(label + ':', 25, y);
        
        doc.setTextColor(30, 41, 59);
        doc.text(String(value), 150, y);
        
        y += 8;
        
        // New page if needed
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });
    
    // Footer
    y = 280;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Gerado por Calculadora Goiás PVC', pageWidth / 2, y + 8, { align: 'center' });
    
    // Save
    doc.save(`goias_pvc_${type}_${Date.now()}.pdf`);
}

// Make available globally
window.generatePDF = generatePDF;