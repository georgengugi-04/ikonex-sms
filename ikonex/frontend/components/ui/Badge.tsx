const colors: Record<string, string> = {
  A: 'bg-green-100 text-green-800', B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800', D: 'bg-orange-100 text-orange-800',
  E: 'bg-red-100 text-red-800', MALE: 'bg-blue-100 text-blue-800',
  FEMALE: 'bg-pink-100 text-pink-800', ADMIN: 'bg-purple-100 text-purple-800',
};
export default function Badge({ text }: { text: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[text] || 'bg-gray-100 text-gray-700'}`}>{text}</span>;
}
