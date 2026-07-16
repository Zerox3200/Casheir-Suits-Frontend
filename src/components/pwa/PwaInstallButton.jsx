import React from 'react'
import { FiDownload, FiShare2, FiX } from 'react-icons/fi'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import { appToast } from '../../helpers/toast'

/**
 * @param {'banner' | 'button' | 'sidebar' | 'icon'} [variant]
 * @param {string} [className]
 */
export default function PwaInstallButton({
  variant = 'button',
  className = '',
}) {
  const {
    showInstall,
    installed,
    canInstall,
    isIos,
    iosHint,
    promptInstall,
    dismissIosHint,
  } = usePwaInstall()

  if (installed || !showInstall) return null

  const onClick = async () => {
    const result = await promptInstall()
    if (result === 'accepted') {
      appToast.success('تم تثبيت التطبيق بنجاح')
      return
    }
    if (result === 'manual') {
      appToast.info(
        'من قائمة المتصفح اختر «تثبيت التطبيق» أو «Install app»'
      )
    }
  }

  const label =
    canInstall || !isIos
      ? variant === 'sidebar' || variant === 'button' || variant === 'icon'
        ? 'تثبيت التطبيق'
        : 'تثبيت التطبيق على الجهاز'
      : 'إضافة إلى الشاشة الرئيسية'

  if (variant === 'icon') {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={onClick}
          className="rounded-lg border border-[#9e7e3a]/35 bg-[#9e7e3a]/10 p-2 text-[#7a6230] transition hover:bg-[#9e7e3a]/20"
          aria-label={label}
          title={label}
        >
          <FiDownload size={18} />
        </button>
        {iosHint ? <IosHint onClose={dismissIosHint} /> : null}
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={onClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#9e7e3a]/35 bg-[#9e7e3a]/10 px-4 py-2.5 text-sm font-semibold text-[#7a6230] transition hover:bg-[#9e7e3a]/18"
        >
          <FiDownload size={16} />
          {label}
        </button>
        {iosHint ? <IosHint onClose={dismissIosHint} /> : null}
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={onClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#9e7e3a]/40 bg-[#9e7e3a]/10 px-3 py-2.5 text-sm font-semibold text-[#7a6230] transition hover:bg-[#9e7e3a]/20"
        >
          <FiDownload size={16} />
          {label}
        </button>
        {iosHint ? <IosHint onClose={dismissIosHint} /> : null}
      </div>
    )
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-lg border border-[#1e2a38]/15 bg-white px-3 py-2 text-sm font-semibold text-[#1e2a38] transition hover:bg-[#f7f5f2]"
      >
        <FiDownload size={16} />
        {label}
      </button>
      {iosHint ? <IosHint onClose={dismissIosHint} /> : null}
    </div>
  )
}

function IosHint({ onClose }) {
  return (
    <div
      role="status"
      className="mt-2 rounded-xl border border-[#1e2a38]/10 bg-white p-3 text-right text-xs leading-relaxed text-[#3d4654] shadow-sm"
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="font-semibold text-[#1e2a38]">تثبيت على آيفون</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-[#8a939e] hover:text-[#1e2a38]"
          aria-label="إغلاق"
        >
          <FiX size={14} />
        </button>
      </div>
      <p className="flex items-start gap-1.5">
        <FiShare2 className="mt-0.5 shrink-0 text-[#9e7e3a]" size={14} />
        <span>
          اضغط مشاركة ثم اختر «إضافة إلى الشاشة الرئيسية» لتثبيت التطبيق.
        </span>
      </p>
    </div>
  )
}
