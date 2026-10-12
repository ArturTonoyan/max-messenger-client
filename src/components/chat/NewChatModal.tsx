import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { HiOutlineX } from 'react-icons/hi'
import { LuLoaderCircle } from 'react-icons/lu'
import { GreenApiError } from '../../api/greenApi'
import { useCreateChat } from '../../hooks/useCreateChat'

type NewChatModalProps = {
  open: boolean
  onClose: () => void
}

type FormValues = {
  phone: string
}

export function NewChatModal({ open, onClose }: NewChatModalProps) {
  const createChat = useCreateChat()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { phone: '' },
  })

  useEffect(() => {
    if (!open) {
      reset()
      createChat.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset])

  if (!open) return null

  const onSubmit = handleSubmit((values) => {
    createChat.mutate(values.phone, {
      onSuccess: () => onClose(),
    })
  })

  const errorMessage =
    createChat.error instanceof GreenApiError
      ? createChat.error.message
      : createChat.error
        ? 'Не удалось создать чат'
        : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal
        aria-labelledby="new-chat-title"
        className="w-full max-w-md rounded-2xl border border-white/8 bg-[#1E2126] p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="new-chat-title" className="text-lg font-semibold text-white">
            Новый чат
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9AA1AC] hover:bg-white/5 hover:text-white"
            aria-label="Закрыть"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <p className="mb-4 text-sm text-[#8B919C]">
          Введите номер телефона получателя в международном формате.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-[#A8ADB7]">
              Номер телефона
            </span>
            <input
              type="tel"
              autoFocus
              placeholder="+7 999 123-45-67"
              className="field"
              {...register('phone', {
                required: 'Укажите номер',
              })}
            />
            {errors.phone && (
              <span className="mt-1 block text-xs text-[#FF8D8D]">
                {errors.phone.message}
              </span>
            )}
          </label>

          {errorMessage && (
            <div className="rounded-xl border border-[#FF5C5C]/25 bg-[#FF5C5C]/10 px-3 py-2.5 text-sm text-[#FFB4B4]">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl bg-white/5 text-sm font-medium text-[#D0D4DB] hover:bg-white/8"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={createChat.isPending}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#5B8CFF] text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              {createChat.isPending ? (
                <>
                  <LuLoaderCircle className="animate-spin" />
                  Проверка…
                </>
              ) : (
                'Создать'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
