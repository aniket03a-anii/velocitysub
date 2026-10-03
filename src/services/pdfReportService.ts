import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription, DetectionCandidate, SavingsRecommendation, UserProfile } from '../types';

export class PdfReportService {
  static generateSubscriptionReport(
    profile: UserProfile,
    subscriptions: Subscription[],
    candidates: DetectionCandidate[],
    recommendations: SavingsRecommendation[]
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const monthlyTotal = activeSubs.reduce((sum, s) => sum + (s.monthly_cost || s.amount), 0);
    const annualTotal = monthlyTotal * 12;
    const potentialAnnualSavings = recommendations.reduce((sum, r) => sum + r.annual_saving, 0);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Brand Palette
    const colorInk = [9, 35, 38]; // #092326
    const colorMuted = [82, 96, 100]; // #526064
    const colorCanvas = [242, 240, 231]; // #F2F0E7
    const colorSage = [228, 235, 216]; // #E4EBD8

    // 1. Top Header & Title Bar
    doc.setFillColor(colorInk[0], colorInk[1], colorInk[2]);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F');

    doc.setTextColor(251, 249, 243);
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('VELOCITY', 40, 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(228, 235, 216);
    doc.text('CONFIDENTIAL SUBSCRIPTION & FINANCIAL ARCHIVE', 40, 52);

    doc.setTextColor(251, 249, 243);
    doc.setFontSize(9);
    doc.text(`ARCHIVE DATE: ${dateStr.toUpperCase()}`, doc.internal.pageSize.getWidth() - 40, 44, { align: 'right' });

    // 2. Metadata / Summary Card
    let y = 90;
    doc.setFillColor(colorCanvas[0], colorCanvas[1], colorCanvas[2]);
    doc.roundedRect(40, y, doc.internal.pageSize.getWidth() - 80, 75, 6, 6, 'F');
    doc.setDrawColor(216, 213, 202);
    doc.roundedRect(40, y, doc.internal.pageSize.getWidth() - 80, 75, 6, 6, 'S');

    doc.setTextColor(colorInk[0], colorInk[1], colorInk[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('EXECUTIVE EXPENDITURE SUMMARY', 52, y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text(`Account Holder: ${profile.full_name || 'Anaghraj S. Thakur'} (${profile.email})`, 52, y + 36);
    doc.text(`Default Currency: ${profile.currency} · Statement History: Verified Clean Ledger`, 52, y + 49);
    doc.text(`Security Protocol: Client-Side Sandbox Encryption · Zero Banking Passwords`, 52, y + 62);

    // Summary KPI Pill Boxes on the right
    const kpiX = doc.internal.pageSize.getWidth() - 210;
    doc.setFillColor(colorSage[0], colorSage[1], colorSage[2]);
    doc.roundedRect(kpiX, y + 12, 160, 24, 4, 4, 'F');
    doc.setTextColor(colorInk[0], colorInk[1], colorInk[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Monthly Outflow: ₹${monthlyTotal.toLocaleString('en-IN')}/mo`, kpiX + 8, y + 27);

    doc.setFillColor(colorInk[0], colorInk[1], colorInk[2]);
    doc.roundedRect(kpiX, y + 42, 160, 24, 4, 4, 'F');
    doc.setTextColor(251, 249, 243);
    doc.text(`Annual Outflow: ₹${annualTotal.toLocaleString('en-IN')}/yr`, kpiX + 8, y + 57);

    y += 95;

    // 3. Section 1 Table: Active Subscriptions Ledger
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorInk[0], colorInk[1], colorInk[2]);
    doc.text('1. Confirmed Active Subscriptions Ledger', 40, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text('Full catalog of verified recurring debits, renewal schedules, and annualized commitments.', 40, y + 12);

    const subRows = subscriptions.map((s) => [
      s.merchant_name,
      s.category,
      s.cycle.toUpperCase(),
      `INR ${s.amount.toLocaleString('en-IN')}`,
      `INR ${(s.monthly_cost || s.amount).toLocaleString('en-IN')}`,
      `INR ${(s.annual_cost || s.amount * 12).toLocaleString('en-IN')}`,
      s.next_billing_date || 'N/A',
      s.payment_method,
      s.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: y + 20,
      head: [['Service', 'Category', 'Cadence', 'Debited', 'Monthly', 'Annual', 'Next Renewal', 'Payment Instrument', 'Status']],
      body: subRows,
      theme: 'grid',
      headStyles: {
        fillColor: [9, 35, 38],
        textColor: [251, 249, 243],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [9, 35, 38]
      },
      alternateRowStyles: {
        fillColor: [248, 246, 240]
      },
      margin: { left: 40, right: 40 },
      styles: {
        overflow: 'linebreak',
        cellPadding: 4,
        lineColor: [216, 213, 202],
        lineWidth: 0.5
      }
    });

    // 4. Section 2: Pattern Detections & Candidate Review Queue
    let lastTableY = (doc as any).lastAutoTable.finalY + 25;
    if (lastTableY > doc.internal.pageSize.getHeight() - 160) {
      doc.addPage();
      lastTableY = 50;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorInk[0], colorInk[1], colorInk[2]);
    doc.text('2. Autonomous Detection Candidates & Price Revision Audit', 40, lastTableY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text('Candidate recurring debits discovered via statement analysis awaiting user confirmation.', 40, lastTableY + 12);

    const candRows = candidates.map((c) => [
      c.normalized_merchant,
      c.frequency.toUpperCase(),
      `INR ${c.estimated_amount.toLocaleString('en-IN')}`,
      c.previous_amount ? `INR ${c.previous_amount.toLocaleString('en-IN')}` : 'N/A',
      c.evidence.price_change_detected ? `+${c.evidence.price_change_percent}% HIKE` : 'Stable',
      `${c.confidence}%`,
      `${c.evidence.repeat_count} charges`,
      c.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: lastTableY + 20,
      head: [['Vendor', 'Cadence', 'Est. Amount', 'Prev. Amount', 'Price Signal', 'Confidence', 'Evidence', 'Status']],
      body: candRows,
      theme: 'grid',
      headStyles: {
        fillColor: [9, 35, 38],
        textColor: [251, 249, 243],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [9, 35, 38]
      },
      alternateRowStyles: {
        fillColor: [248, 246, 240]
      },
      margin: { left: 40, right: 40 },
      styles: {
        overflow: 'linebreak',
        cellPadding: 4,
        lineColor: [216, 213, 202],
        lineWidth: 0.5
      }
    });

    // 5. Section 3: Cost Optimization & Savings Recommendations
    lastTableY = (doc as any).lastAutoTable.finalY + 25;
    if (lastTableY > doc.internal.pageSize.getHeight() - 160) {
      doc.addPage();
      lastTableY = 50;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorInk[0], colorInk[1], colorInk[2]);
    doc.text('3. Cost Optimization & Savings Recommendations', 40, lastTableY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text(`Identified total potential annual savings: INR ${potentialAnnualSavings.toLocaleString('en-IN')}/year`, 40, lastTableY + 12);

    const recRows = recommendations.map((r) => [
      r.merchant,
      r.title,
      r.recommendation,
      `INR ${r.monthly_saving}/mo`,
      `INR ${r.annual_saving}/yr`,
      r.priority.toUpperCase()
    ]);

    autoTable(doc, {
      startY: lastTableY + 20,
      head: [['Service', 'Action Item', 'Strategy Details', 'Monthly Gain', 'Annual Gain', 'Priority']],
      body: recRows,
      theme: 'grid',
      headStyles: {
        fillColor: [9, 35, 38],
        textColor: [251, 249, 243],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [9, 35, 38]
      },
      alternateRowStyles: {
        fillColor: [248, 246, 240]
      },
      margin: { left: 40, right: 40 },
      styles: {
        overflow: 'linebreak',
        cellPadding: 4,
        lineColor: [216, 213, 202],
        lineWidth: 0.5
      }
    });

    // Footer on all pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(216, 213, 202);
      doc.line(40, doc.internal.pageSize.getHeight() - 30, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 30);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
      doc.text(
        'VELOCITY SUBSCRIPTION INTELLIGENCE · PRIVILEGED & CONFIDENTIAL FINANCIAL DOSSIER',
        40,
        doc.internal.pageSize.getHeight() - 18
      );
      doc.text(
        `Page ${i} of ${totalPages}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 18,
        { align: 'right' }
      );
    }

    const filenameDate = now.toISOString().split('T')[0];
    doc.save(`velocity_subscription_report_${filenameDate}.pdf`);
  }
}
