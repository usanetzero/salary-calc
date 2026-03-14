"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
}

export function FAQSection({
  title = "Frequently Asked Questions",
  subtitle,
  items,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-8" itemScope itemType="https://schema.org/FAQPage">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            {subtitle}
          </p>
        )}
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-sm pr-4" itemProp="name">
                {item.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index ? "max-h-96" : "max-h-0"
              }`}
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <div
                className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed"
                itemProp="text"
              >
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
