export default function AnnouncementBar({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  // Velocidad pareja sin importar cuántos mensajes haya: más texto, más segundos de vuelta.
  const totalChars = messages.join(" ").length;
  const duration = Math.max(15, totalChars * 0.35);

  const track = (hidden: boolean) => (
    <div className="flex shrink-0" aria-hidden={hidden || undefined}>
      {messages.map((message, index) => (
        <span key={index} className="px-8 whitespace-nowrap">
          {message}
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-red-600 text-white text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase py-1.5 overflow-hidden">
      <div className="flex w-max animate-marquee" style={{ animationDuration: `${duration}s` }}>
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
