
type Props = {
  children:
    React.ReactNode;
};

export function
ActionPanel({
  children,
}: Props) {
  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-lg">
      
      <h2 className="text-2xl font-bold mb-6">
        Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {children}

      </div>
    </div>
  );
}
