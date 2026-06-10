import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function EmailModal({ isOpen, onClose, email }: EmailModalProps) {
  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGmailFallback = (emailSubject: string, emailBody: string) => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    const composeWindow = window.open(gmailUrl, "_blank", "noopener,noreferrer");

    if (!composeWindow) {
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailSubject = subject.trim() || "Portfolio message";
    const emailBody = [
      `Name: ${senderName.trim()}`,
      `Email: ${senderEmail.trim()}`,
      "",
      "Message:",
      message.trim(),
    ].join("\n");

    setIsSending(true);
    setDeliveryStatus("Sending message...");

    try {
      const formData = new FormData();
      formData.append("name", senderName.trim());
      formData.append("email", senderEmail.trim());
      formData.append("subject", emailSubject);
      formData.append("message", message.trim());
      formData.append("_subject", emailSubject);
      formData.append("_template", "table");
      formData.append("_captcha", "false");

      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Form delivery failed");
      }

      setDeliveryStatus("Sent. Check your email inbox. If first time ni, confirm FormSubmit activation email first.");
      setSenderName("");
      setSenderEmail("");
      setSubject("");
      setMessage("");
    } catch {
      openGmailFallback(emailSubject, emailBody);
      setDeliveryStatus("Direct send was blocked, so Gmail compose opened. Click Send there.");
    } finally {
      setIsSending(false);
    }
  };

  const canSend = senderName.trim() && senderEmail.trim() && subject.trim() && message.trim();

  const sendButtonLabel = () => {
    if (isSending) {
      return "Sending...";
    }

    if (!canSend) {
      return "Fill all fields";
    }

    return "Send message";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-2 pt-16 sm:p-3 sm:pt-16 lg:items-start lg:pt-16">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative flex max-h-[calc(100dvh-4.5rem)] w-full max-w-[45rem] flex-col overflow-hidden rounded-xl border border-gray-800 bg-[#0b0f19] shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Header */}
            <div className="shrink-0 border-b border-gray-800/60 bg-gradient-to-b from-[#111827] to-[#0b0f19] p-3 pr-12 sm:p-4 sm:pr-14">
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">Send me an email</h2>
              <p className="mt-1 text-xs text-gray-400 sm:text-sm">Fill this out to send a message directly from the site.</p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row">
              {/* Left Column (Delivery Route) */}
              <div className="w-full border-b border-gray-800/60 bg-[#0b0f19] p-3 sm:p-4 md:w-[33%] md:border-b-0 md:border-r">
                <div className="rounded-lg border border-cyan-500/20 bg-[#111827] p-4 shadow-inner">
                  <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-cyan-500">Delivery Route</p>
                  <h3 className="mb-1 text-base font-bold text-white">Direct to my inbox</h3>
                  <p className="mb-5 break-all text-xs text-gray-400 sm:text-sm">{email}</p>
                  
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white font-medium transition-colors w-full justify-center"
                  >
                    {copied ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                    {copied ? "Copied!" : "Copy email"}
                  </button>
                </div>
              </div>

              {/* Right Column (Form) */}
              <div className="w-full bg-[#0a0d14] p-3 sm:p-4 md:w-[67%]">
                <form className="space-y-2.5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-white">Your name</label>
                      <input 
                        type="text" 
                        placeholder="Name" 
                        value={senderName}
                        onChange={(event) => setSenderName(event.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-800 bg-[#111827] px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-white">Your email</label>
                      <input 
                        type="email" 
                        placeholder="Gmail" 
                        value={senderEmail}
                        onChange={(event) => setSenderEmail(event.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-800 bg-[#111827] px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-white">Subject</label>
                    <input 
                      type="text" 
                      placeholder="Project inquiry, collaboration, or job opportunity" 
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-800 bg-[#111827] px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-bold text-white">Message</label>
                      <span className="text-xs text-gray-500">{message.length}/1200</span>
                    </div>
                    <textarea 
                      rows={3}
                      placeholder="Tell me a bit about your project, role, or question..." 
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      maxLength={1200}
                      required
                      className="min-h-[5.3rem] w-full resize-y rounded-lg border border-gray-800 bg-[#111827] px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    ></textarea>
                  </div>

                  <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                    <p className="text-xs text-gray-500 max-w-[250px]">
                      {deliveryStatus || "Required fields help keep replies fast and organized."}
                    </p>
                    <button 
                      type="submit"
                      disabled={isSending || !canSend}
                      className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-[#162032] px-5 py-2.5 font-bold text-cyan-400 shadow-lg transition-all hover:bg-cyan-900/40 hover:shadow-cyan-900/20 disabled:opacity-50"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                      {sendButtonLabel()}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
