
export function DashboardHeader() {
  return (
    <div className="navbar bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl px-6 shadow-2xl">
      <div className="flex-1">
        <div>
          <h1 className="text-3xl font-black text-white">
            Aave V3 Dashboard
          </h1>

          <p className="text-slate-300">
            Decentralized Lending Protocol
          </p>
        </div>
      </div>

      <div className="flex-none">
        <div className="badge badge-success badge-lg gap-2 shadow-lg">
          Live
        </div>
      </div>
    </div>
  );
}

