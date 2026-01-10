import QrCodeView from '../components/QrCodeView'

export const dynamic = 'force-dynamic'

export default function QrPage() {
  const appUrl = process.env.APP_URL
  const initialUrl = appUrl ? `${appUrl}/survey` : undefined

  return <QrCodeView initialUrl={initialUrl} />
}
