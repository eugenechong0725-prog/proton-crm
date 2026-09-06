import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/phone";

export function WhatsAppButton({
  phone,
  message,
  label = "WhatsApp",
  className,
}: {
  phone: string;
  message?: string;
  label?: string;
  className?: string;
}) {
  const href = whatsappUrl(phone, message);

  if (!href) {
    return (
      <Button type="button" variant="outline" className={className} disabled>
        Invalid phone
      </Button>
    );
  }

  return (
    <Button asChild variant="whatsapp" className={className}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        {label}
      </a>
    </Button>
  );
}
