import { useForm } from 'react-hook-form'
import { IoSend } from 'react-icons/io5'
import { LuLoaderCircle } from 'react-icons/lu'
import { useSendMessage } from '../../hooks/useSendMessage'

type MessageInputProps = {
  chatId: string
}

type FormValues = {
  text: string
}

export function MessageInput({ chatId }: MessageInputProps) {
  const send = useSendMessage()
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: { text: '' },
  })

  const text = watch('text')

  const onSubmit = handleSubmit((values) => {
    const trimmed = values.text.trim()
    if (!trimmed || send.isPending) return

    send.mutate(
      { chatId, text: trimmed },
      {
        onSuccess: () => reset({ text: '' }),
      },
    )
  })

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-white/5 bg-[#17191D] px-3 py-3 sm:px-4"
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          rows={1}
          placeholder="Сообщение"
          className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-transparent bg-[#23262C] px-4 py-2.5 text-[15px] text-white outline-none placeholder:text-[#6E7480] focus:border-[#5B8CFF]/35"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void onSubmit()
            }
          }}
          {...register('text', {
            maxLength: 4000,
          })}
        />
        <button
          type="submit"
          disabled={!text.trim() || send.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5B8CFF] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Отправить"
        >
          {send.isPending ? (
            <LuLoaderCircle className="animate-spin text-lg" />
          ) : (
            <IoSend className="text-lg" />
          )}
        </button>
      </div>
      {send.isError && (
        <p className="mx-auto mt-2 max-w-3xl text-xs text-[#FF8D8D]">
          Не удалось отправить. Попробуйте ещё раз.
        </p>
      )}
    </form>
  )
}
