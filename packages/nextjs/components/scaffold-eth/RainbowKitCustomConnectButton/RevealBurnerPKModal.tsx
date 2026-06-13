import { useRef } from "react";
import { rainbowkitBurnerWallet } from "burner-connector";

import {
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

import {
  useCopyToClipboard,
} from "~~/hooks/scaffold-eth";

import {
  getParsedError,
  notification,
} from "~~/utils/scaffold-eth";

const BURNER_WALLET_PK_KEY =
  "burnerWallet.pk";

export const RevealBurnerPKModal = () => {

  const {
    copyToClipboard,
    isCopiedToClipboard,
  } = useCopyToClipboard();

  const modalCheckboxRef =
    useRef<HTMLInputElement>(null);

  const handleCopyPK = async () => {

    try {

      const storage =
        rainbowkitBurnerWallet.useSessionStorage
          ? sessionStorage
          : localStorage;

      const burnerPK =
        storage?.getItem(
          BURNER_WALLET_PK_KEY
        );

      if (!burnerPK)
        throw new Error(
          "Không tìm thấy khóa riêng tư"
        );

      await copyToClipboard(burnerPK);

      notification.success(
        "Đã sao chép khóa riêng tư"
      );

    } catch (e) {

      const parsedError =
        getParsedError(e);

      notification.error(parsedError);

      if (modalCheckboxRef.current)
        modalCheckboxRef.current.checked =
          false;
    }
  };

  return (
    <>
      <div>

        <input
          type="checkbox"
          id="reveal-burner-pk-modal"
          className="modal-toggle"
          ref={modalCheckboxRef}
        />

        <label
          htmlFor="reveal-burner-pk-modal"
          className="modal cursor-pointer"
        >

          <label className="modal-box relative">

            {/* dummy input */}
            <input className="h-0 w-0 absolute top-0 left-0" />

            <label
              htmlFor="reveal-burner-pk-modal"
              className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
            >
              ✕
            </label>

            <div>

              <p className="text-lg font-semibold m-0 p-0">
                Sao chép khóa riêng tư ví test
              </p>

              <div
                role="alert"
                className="alert alert-warning mt-4"
              >

                <ShieldExclamationIcon className="h-6 w-6" />

                <span className="font-semibold">

                  Ví test chỉ dành cho phát triển cục bộ
                  và không an toàn để lưu trữ tài sản thật.

                </span>

              </div>

              <p className="mt-4">

                Khóa riêng tư cho phép truy cập
                toàn bộ ví và tài sản của bạn.

                Hiện tại khóa này chỉ được lưu tạm
                trong trình duyệt.

              </p>

              <button
                className="btn btn-outline btn-error mt-4"
                onClick={handleCopyPK}
                disabled={isCopiedToClipboard}
              >

                Sao chép khóa riêng tư

              </button>

            </div>

          </label>

        </label>

      </div>
    </>
  );
};