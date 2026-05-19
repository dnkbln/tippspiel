const berlinDateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatBerlinDateTime(value: string): string {
  return berlinDateTimeFormatter.format(new Date(value));
}
