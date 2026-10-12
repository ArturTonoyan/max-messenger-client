import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineKey,
  HiOutlineServer,
} from 'react-icons/hi'
import { LuLoaderCircle } from 'react-icons/lu'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { GreenApiError } from '../../api/greenApi'
import { useLogin, type LoginFormValues } from '../../hooks/useLogin'
import { MaxLogo } from '../ui/MaxLogo'

const tips = [
  {
    title: 'Где взять данные',
    text: 'idInstance и apiTokenInstance — в кабинете console.green-api.com у вашего инстанса MAX.',
  },
  {
    title: 'Только текст',
    text: 'Клиент умеет отправлять и принимать текстовые сообщения через GREEN-API.',
  },
  {
    title: 'Входящие сообщения',
    text: 'Очередь читается через ReceiveNotification и подтверждается DeleteNotification.',
  },
]

export function LoginPage() {
  const login = useLogin()
  const [showToken, setShowToken] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      idInstance: '',
      apiTokenInstance: '',
      apiUrl: '',
    },
  })

  const onSubmit = handleSubmit((values) => {
    login.mutate(values)
  })

  const errorMessage =
    login.error instanceof GreenApiError
      ? login.error.message
      : login.error
        ? 'Не удалось войти. Проверьте данные инстанса.'
        : null

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[#141618] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(91,140,255,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(139,92,255,0.1),_transparent_40%)]" />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-5">
        <section className="rounded-[28px] border border-white/5 bg-[#1A1C20] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <MaxLogo size={48} />
            <div>
              <h1 className="text-xl font-semibold text-white">MAX</h1>
              <p className="text-sm text-[#8B919C]">Вход через GREEN-API</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Войти в инстанс
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8B919C]">
            Вставьте сюда{' '}
            <span className="text-[#C5CAD3]">idInstance</span> и{' '}
            <span className="text-[#C5CAD3]">apiTokenInstance</span> из{' '}
            <a
              href="https://console.green-api.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#7EB0FF] hover:underline"
            >
              console.green-api.com
            </a>
          </p>

          <form className="mt-7 space-y-4" onSubmit={onSubmit} noValidate>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm text-[#A8ADB7]">
                <HiOutlineServer className="text-base" />
                idInstance
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="3100123456"
                className="field"
                {...register('idInstance', {
                  required: 'Укажите idInstance',
                  pattern: {
                    value: /^\d+$/,
                    message: 'Только цифры',
                  },
                })}
              />
              {errors.idInstance && (
                <span className="mt-1 block text-xs text-[#FF8D8D]">
                  {errors.idInstance.message}
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm text-[#A8ADB7]">
                <HiOutlineKey className="text-base" />
                apiTokenInstance
              </span>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  autoComplete="off"
                  placeholder="Токен инстанса"
                  className="field field-with-action"
                  {...register('apiTokenInstance', {
                    required: 'Укажите apiTokenInstance',
                    minLength: {
                      value: 8,
                      message: 'Слишком короткий токен',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#8B919C] hover:text-white"
                  onClick={() => setShowToken((value) => !value)}
                  aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
                >
                  {showToken ? (
                    <HiOutlineEyeOff className="text-lg" />
                  ) : (
                    <HiOutlineEye className="text-lg" />
                  )}
                </button>
              </div>
              {errors.apiTokenInstance && (
                <span className="mt-1 block text-xs text-[#FF8D8D]">
                  {errors.apiTokenInstance.message}
                </span>
              )}
            </label>

            <button
              type="button"
              className="text-sm text-[#7EB0FF] hover:underline"
              onClick={() => setShowAdvanced((value) => !value)}
            >
              {showAdvanced ? 'Скрыть apiUrl' : 'Указать apiUrl вручную'}
            </button>

            {showAdvanced && (
              <label className="block">
                <span className="mb-1.5 block text-sm text-[#A8ADB7]">
                  apiUrl (опционально)
                </span>
                <input
                  type="url"
                  placeholder="https://3100.api.green-api.com"
                  className="field"
                  {...register('apiUrl')}
                />
                <span className="mt-1 block text-xs text-[#6E7480]">
                  Если пусто — хост соберётся из первых 4 цифр idInstance
                </span>
              </label>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-[#FF5C5C]/25 bg-[#FF5C5C]/10 px-3.5 py-3 text-sm leading-relaxed text-[#FFB4B4]">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#5B8CFF_0%,#7A6CFF_100%)] text-[15px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {login.isPending ? (
                <>
                  <LuLoaderCircle className="animate-spin text-lg" />
                  Проверяем инстанс…
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>
        </section>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-white/5 bg-[#1A1C20]/80 p-4">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4200, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            spaceBetween={12}
            className="login-tips"
          >
            {tips.map((tip) => (
              <SwiperSlide key={tip.title}>
                <div className="px-1 pb-6">
                  <p className="text-sm font-medium text-[#7EB0FF]">
                    {tip.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#A8ADB7]">
                    {tip.text}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
