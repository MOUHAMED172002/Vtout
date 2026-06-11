import React, { useEffect, useState } from "react";


/**
 * TicketThread (mis à jour)
 * - Utilise supabase.auth.getUser() (supabase-js v2) pour vérifier la session avant envoi.
 * - Sélection explicite des colonnes depuis ticket_messages (et attachments si présents).
 * - Gestion robuste des cas non authentifiés et des erreurs.
 * - Recharge les messages après envoi et protège l'affichage pendant le chargement.
 */

export default function TicketThread({ ticket, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const { data: sessionData } = await supabase.auth.getUser();
        if (sessionData && sessionData.user) {
          if (mounted) setCurrentUserId(sessionData.user.id);
        } else {
          if (mounted) setCurrentUserId(null);
        }
      } catch (err) {
        console.error("TicketThread: getUser error", err);
        if (mounted) setCurrentUserId(null);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket]);

  async function load() {
    if (!ticket) return;
    setLoading(true);
    try {
      // select explicit columns; include attachments if you support them
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("id,ticket_id,sender_id,body,attachments,created_at")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (err) {
      console.error("load messages", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!ticket) return alert("Ticket invalide.");
    if (!body.trim()) return;
    setSending(true);
    try {
      // Ensure user is authenticated via getUser()
      const { data: sessionData, error: sessionErr } = await supabase.auth.getUser();
      if (sessionErr || !sessionData || !sessionData.user) {
        alert("Vous devez être connecté(e) pour envoyer un message.");
        setSending(false);
        return;
      }
      const userId = sessionData.user.id;

      const payload = {
        ticket_id: ticket.id,
        sender_id: userId,
        body: body.trim(),
        // attachments: [] // add attachments handling if needed
      };

      const { error } = await supabase.from("ticket_messages").insert(payload, { returning: "minimal" });
      if (error) throw error;

      setBody("");
      await load();
    } catch (err) {
      console.error("send message", err);
      alert("Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card bg-base-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium">{ticket?.subject || "Ticket"}</div>
          <div className="text-xs text-gray-500">Status: {ticket?.status || "—"}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Fermer</button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto mb-3">
        {loading ? (
          <div>Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun message pour ce ticket.</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`p-2 border rounded ${m.sender_id === currentUserId ? "bg-blue-50 self-end" : "bg-base-100"}`}
            >
              <div className="text-xs text-gray-500">
                {m.sender_id === currentUserId ? "Vous" : "Support"} • {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
              </div>
              <div className="mt-1">{m.body}</div>
              {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {m.attachments.map((att, idx) => (
                    <a key={idx} href={att.url || att} target="_blank" rel="noreferrer" className="text-xs link">
                      Pièce jointe {idx + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1 input-bordered"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Écrire un message..."
          disabled={sending}
        />
        <button className="btn btn-primary" onClick={send} disabled={sending}>
          {sending ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}