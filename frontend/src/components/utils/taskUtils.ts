export interface DescriptionItem {
  text: string;
  completed: boolean;
}

export const convertStringToDescriptionArray = (desc?: string) => {
  return desc
    ? desc.split("\n").map((text) => ({ text, completed: false }))
    : [];
};

export const convertDescriptionArrayToString = (desc: DescriptionItem[]) =>
  desc.map((d) => d.text).join("\n");

export const formatTimeToAMPM = (time24: string) => {
  if (!time24) return "";
  const [hh, mm] = time24.split(":");
  if (!hh || !mm) return time24;
  let h = parseInt(hh, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mm} ${suffix}`;
};

export const getTodayString = (): string => {
  const d = new Date();
  const midnight = new Date(d.setHours(0, 0, 0, 0));
  return midnight.toISOString().split("T")[0];
};
