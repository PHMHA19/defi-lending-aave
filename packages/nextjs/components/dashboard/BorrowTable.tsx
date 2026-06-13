export const BorrowTable = () => {
  return (
    <div className="bg-base-200 rounded-2xl p-6 shadow">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Khoản vay
        </h2>

        <button className="btn btn-secondary">
          Vay thêm
        </button>

      </div>

      <table className="table">

        <thead>
          <tr>
            <th>Token</th>
            <th>Số lượng</th>
            <th>Lãi suất</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td
              colSpan={4}
              className="text-center py-10 opacity-50"
            >
              Chưa có khoản vay nào
            </td>
          </tr>

        </tbody>

      </table>
    </div>
  );
};
