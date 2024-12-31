export const Header = () => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-medium">JD</span>
      </div>
    </header>
  );
};