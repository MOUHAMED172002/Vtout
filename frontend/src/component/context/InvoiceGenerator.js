/**
 * Helper to normalize strings for comparison
 */
function formatAmount(num) {
    return new Intl.NumberFormat('fr-FR').format(num || 0).replace(/\s/g, ' ') + ' F';
}

function normalize(s) {
    return (s || "").toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * Generate and download PDF invoice for the given order.
 */
export async function generateInvoicePDF(order) {
    if (!order) {
        console.error("No order data provided to generateInvoicePDF");
        return;
    }

    try {
        const jspdfModule = await import("jspdf");
        const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
        const autotableModule = await import("jspdf-autotable");
        const autoTable = autotableModule.default || autotableModule;
        const qrcodeModule = await import("qrcode");
        const QRCode = qrcodeModule.default || qrcodeModule;

        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();

        // Standard Margins
        const MX = 20;
        const MY = 20;

        // Constants
        const ColorBlue = [28, 126, 214];
        const ColorDark = [33, 37, 41];
        const ColorLightGray = [248, 249, 250];
        const ColorTextGray = [108, 117, 125];
        const ColorWhite = [255, 255, 255];

        // ── 1. HEADER (Logo & Banner) ──
        doc.setFillColor(...ColorBlue);
        doc.triangle(MX, MY, MX + 5, MY - 5, MX + 10, MY, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...ColorDark);
        doc.text("VTOUT", MX + 15, MY + 3);
        doc.setFontSize(9);
        doc.setTextColor(...ColorTextGray);
        doc.text("NOUS VENDONS TOUT", MX + 15, MY + 8);

        // Banner
        const bannerW = 80;
        const bannerH = 20;
        doc.setFillColor(...ColorBlue);
        doc.path([
            { op: 'm', c: [W - bannerW, 10] },
            { op: 'l', c: [W, 10] },
            { op: 'l', c: [W, 10 + bannerH] },
            { op: 'l', c: [W - bannerW + 8, 10 + bannerH] },
            { op: 'l', c: [W - bannerW, 10 + bannerH / 2] },
            { op: 'h', c: [] }
        ]).fill();
        doc.setTextColor(...ColorWhite);
        doc.setFontSize(22);
        doc.text("FACTURE", W - MX, 19, { align: "right" });
        doc.setFontSize(10);
        doc.text(`N° ${(order.id || "").slice(0, 8).toUpperCase()}`, W - MX, 26, { align: "right" });

        // ── 2. INFO SECTION ──
        let currentY = 55;
        doc.setTextColor(...ColorTextGray);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("FACTURÉ À", MX, currentY);

        doc.setTextColor(...ColorDark);
        doc.setFontSize(13);
        const profile = order.profile || {};
        const pFullName = profile.fullname || (profile.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : "");
        const fullName = order.guest_name || pFullName || "Client Vtout";
        doc.text(fullName, MX, currentY + 7);

        doc.setTextColor(...ColorTextGray);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const address = order.address?.address_line || order.address?.quartier_label || "Bénin";
        doc.text(address, MX, currentY + 13);
        const clientEmail = order.guest_email || profile.email || "";
        const clientPhone = order.guest_phone || profile.phone || order.address?.phone || "";
        doc.text(`${clientEmail}${clientEmail && clientPhone ? " | " : ""}${clientPhone}`, MX, currentY + 18);

        // Dates (Aligned Right)
        const dateObj = new Date(order.created_at || order.createdAt || Date.now());
        const dateStr = dateObj.toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric' });
        const dueDate = new Date(dateObj);
        dueDate.setDate(dueDate.getDate() + 7);
        const dueDateStr = dueDate.toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric' });

        doc.text("Date de Reçus", W - 60, currentY + 7);
        doc.setTextColor(...ColorDark);
        doc.setFont("helvetica", "bold");
        doc.text(dateStr, W - 60, currentY + 13);

        // Total Due Box (Properly aligned)
        doc.setFillColor(...ColorLightGray);
        doc.roundedRect(W - 70, currentY + 22, 50, 15, 2, 2, "F");
        doc.setTextColor(...ColorTextGray);
        doc.setFontSize(8);
        doc.text("TOTAL À PAYER", W - 45, currentY + 28, { align: "center" });
        doc.setTextColor(...ColorDark);
        doc.setFontSize(12);
        doc.text(formatAmount(order.total_amount), W - 45, currentY + 34, { align: "center" });

        // ── 3. TABLE ──
        currentY = 105;
        const rawItems = order.items || order.OrderItems || [];
        const itemsData = rawItems.map((it, idx) => [
            String(idx + 1).padStart(1, '0'),
            it.product?.name || it.name || "Produit",
            formatAmount(it.price),
            it.quantity || 1,
            formatAmount(Number(it.price || 0) * Number(it.quantity || 1))
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [["N°", "DESCRIPTION", "PRIX", "QUANTITÉ", "TOTAL"]],
            body: itemsData,
            theme: "striped",
            headStyles: { fillColor: ColorDark, textColor: ColorWhite, fontSize: 9, fontStyle: "bold", halign: "center", cellPadding: 4 },
            bodyStyles: { fontSize: 8, cellPadding: 5, textColor: ColorDark },
            columnStyles: {
                0: { halign: "center", cellWidth: 12 },
                1: { halign: "left" },
                2: { halign: "center", cellWidth: 30 },
                3: { halign: "center", cellWidth: 25 },
                4: { halign: "right", cellWidth: 35 }
            },
            margin: { left: MX, right: MX }
        });

        // ── 4. FOOTER & TOTALS ──
        currentY = doc.lastAutoTable.finalY + 15;

        // Left Column (Payment & Note)
        doc.setTextColor(...ColorDark);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("MODES DE PAIEMENT", MX, currentY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const pm = order.payment_method === 'fedapay' ? 'Paiement en ligne (FedaPay)' : 'Paiement à la livraison';
        doc.text(pm, MX, currentY + 7);
        doc.setTextColor(...ColorTextGray);
        doc.setFontSize(7);
        doc.text("Cette facture est générée numériquement.", MX, currentY + 12);

        // Right Column (Calculations)
        const totalX = W - MX;
        doc.setTextColor(...ColorTextGray);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Sous-Total", W - 70, currentY);
        doc.text(formatAmount(order.total_amount), totalX, currentY, { align: "right" });
        doc.text("Taxe (0%)", W - 70, currentY + 7);
        doc.text("0 F", totalX, currentY + 7, { align: "right" });

        doc.setFillColor(...ColorBlue);
        doc.roundedRect(W - 75, currentY + 12, 55, 10, 1, 1, "F");
        doc.setTextColor(...ColorWhite);
        doc.text("TOTAL :", W - 70, currentY + 19);
        doc.text(formatAmount(order.total_amount), totalX - 4, currentY + 19, { align: "right" });

        // ── 5. BOTTOM BAR ──
        const bottomY = H - 30;
        try {
            const qrDataUrl = await QRCode.toDataURL(`https://vtout.bj/track/${order.id}`, { margin: 1 });
            doc.setFillColor(...ColorBlue);
            doc.rect(MX, bottomY, 20, 20, "F");
            doc.addImage(qrDataUrl, "PNG", MX + 1, bottomY + 1, 18, 18);
        } catch (e) { }

        doc.setTextColor(...ColorDark);
        doc.setFontSize(11);
        doc.text("MERCI POUR VOTRE ACHAT", W / 2 + 10, bottomY + 8, { align: "center" });
        doc.setFontSize(7);
        doc.setTextColor(...ColorTextGray);
        doc.text("+229 61 23 45 67  |  contact@vtout.bj  |  Cotonou, Bénin", W / 2 + 10, bottomY + 15, { align: "center" });

        doc.save(`FACTURE_${(order.id || "").slice(0, 8).toUpperCase()}.pdf`);
    } catch (err) {
        console.error("Invoice Error:", err);
        throw err;
    }
}

/**
 * Hook to check if invoice is downloadable.
 */
export function useInvoiceAvailable(order) {
    if (!order) return false;
    const pm = normalize(order.payment_method);
    const ps = normalize(order.payment_status);
    const st = normalize(order.status);
    if (pm === "fedapay" && ps === "paye") return true;
    if (pm === "delivery" && st === "livree") return true;
    if (ps === "paye") return true;
    return false;
}
