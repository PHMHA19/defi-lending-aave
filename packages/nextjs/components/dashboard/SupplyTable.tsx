"use client";

import { useState } from "react";

import { SupplyModal } from "./SupplyModal";

export const SupplyTable = () => {

  const [openModal, setOpenModal] =
    useState(false);

  return (
    <>
      <div className="bg-base-200 rounded-2xl p-6 shadow mb-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Tài sản đã nạp
          </h2>

          <button
            className="btn btn-primary"
            onClick={() => setOpenModal(true)}
          >
            Nạp tài sản
          </button>

        </div>

        <table className="table">

          <thead>
            <tr>
              <th>Token</th>
              <th>Số lượng</th>
              <th>Lãi suất (APY)</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td
                colSpan={4}
                className="text-center py-10 opacity-50"
              >
                Chưa có tài sản nào được nạp
              </td>
            </tr>

          </tbody>

        </table>

      </div>

      {/* Modal */}
      <SupplyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};
