/**
 * The store hand-off inside the reading (DESIGN_SYSTEM.md §7.9, UX_PSYCHOLOGY.md
 * §8): the official Play badge with a utm referrer, the price line directly
 * under it (values from site.ts), "Only from Google Play"; on iPhone the honest
 * note instead of any badge; on desktop a QR tile. Never an APK link.
 */

import { playStoreUrl, site, type Locale } from '../../config/site';
import { t } from '../../i18n';
import { qrMatrix } from '../../lib/qr';

interface Props {
  locale: Locale;
  /** utm_campaign: where in the reading (reading, lock, zero). */
  placement: 'reading' | 'lock' | 'zero' | 'account';
  qr?: boolean;
  onClick?: () => void;
}

export default function Store({ locale, placement, qr = false, onClick }: Props) {
  const dict = t(locale).store;
  const href = playStoreUrl({ medium: 'reading', campaign: placement, locale });
  const prices = [
    dict.freeToInstall,
    dict.plansFrom(site.appPrices.planFromPerMonth),
    dict.packsFrom(site.appPrices.packFrom),
    ...(site.appSizeMb ? [dict.size(site.appSizeMb)] : []),
    dict.noAds,
  ];
  const matrix = qr ? qrMatrix(playStoreUrl({ medium: 'reading', campaign: `${placement}_qr` })) : null;
  const badge = locale === 'hi' ? '/badges/google-play-hi.png' : '/badges/google-play-en.png';

  return (
    <div className="rd-store">
      <div className="not-ios">
        <a className="rd-store-badge" href={href} data-store-link="" onClick={onClick}>
          <img src={badge} alt={dict.badgeAlt} width={646} height={250} />
        </a>
        <ul className="price-line rd-price-line text-small" aria-label={dict.priceLabel}>
          {prices.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-small rd-muted">{dict.onlyPlay}</p>
        {(site.appNameOnPlay as string) !== site.brand && <p className="text-small rd-muted">{dict.playName(site.appNameOnPlay)}</p>}
      </div>
      <p className="only-ios rd-ios text-small">{dict.iphoneNote}</p>
      {matrix && (
        <figure className="only-desktop rd-qr">
          <svg viewBox={`0 0 ${matrix.size} ${matrix.size}`} role="img" aria-label={dict.badgeAlt} shapeRendering="crispEdges">
            <rect className="rd-qr-light" width={matrix.size} height={matrix.size} rx={matrix.size * 0.068} />
            <path className="rd-qr-dark" d={matrix.path} />
          </svg>
          <figcaption className="text-small rd-muted">{dict.qrCaption}</figcaption>
        </figure>
      )}
    </div>
  );
}
