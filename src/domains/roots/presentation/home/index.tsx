import { getAccessibilityId } from "@/shared/a11y/constants";
import { PRODUCT_BRAND_NAME } from "@/shared/constants/brand";
import {
  HERO_PROOF_KEYS,
  IMPACT_KEYS,
  PREVIEW_COLUMNS,
  RHYTHM_KEYS,
  VALUE_KEYS,
} from "@/shared/constants/landing";
import { AUTH_PAGE_ROUTES, PAGE_ROUTES } from "@/shared/constants/routes";
import Link from "@/shared/design-system/link";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import type { Locale } from "@/shared/i18n/config";
import { getStaticTranslator } from "@/shared/i18n/staticTranslator";
import { buildFeaturePreviewContent } from "@/shared/utils/landingUtils";

import styles from "./home.module.scss";

type HomeProps = {
  locale: Locale;
};

const createNamespaceTranslationGetter = async (
  locale: Locale,
  namespace: string
) => {
  const t = getStaticTranslator(locale, namespace);
  return (key: string): string => t(key);
};

const getCtaClassName = (...classNames: Array<string | undefined>) => {
  return classNames.filter(Boolean).join(" ");
};

const Home = async ({ locale }: HomeProps) => {
  const [
    tHero,
    tValues,
    tFeatures,
    tExamples,
    tImpact,
    tRhythm,
    tCta,
    tFooter,
  ] = await Promise.all([
    createNamespaceTranslationGetter(locale, "pages.landing.hero"),
    createNamespaceTranslationGetter(locale, "pages.landing.values"),
    createNamespaceTranslationGetter(locale, "pages.landing.features"),
    createNamespaceTranslationGetter(locale, "pages.landing.examples"),
    createNamespaceTranslationGetter(locale, "pages.landing.impact"),
    createNamespaceTranslationGetter(locale, "pages.landing.rhythm"),
    createNamespaceTranslationGetter(locale, "pages.landing.cta"),
    createNamespaceTranslationGetter(locale, "pages.landing.footer"),
  ]);

  const homePrefix = `/${locale}`;
  const legal = `${homePrefix}${PAGE_ROUTES.LEGAL}`;
  const featurePreview = buildFeaturePreviewContent("board", tExamples);
  const previewAnchor = `#${getAccessibilityId("landing-example-preview")}`;
  const primaryCtaClassName = getCtaClassName(
    styles["landing-hero__cta"],
    styles["landing-hero__ctaPrimary"]
  );
  const ghostCtaClassName = getCtaClassName(
    styles["landing-hero__cta"],
    styles["landing-hero__ctaGhost"]
  );
  const secondaryCtaClassName = getCtaClassName(
    styles["landing-hero__cta"],
    styles["landing-hero__ctaSecondary"]
  );

  return (
    <main className={styles["landing-page"]}>
      <header className={styles["landing-hero"]}>
        <div className={styles["landing-hero__aurora"]} aria-hidden="true" />
        <div className={styles["landing-hero__content"]}>
          <div
            className={styles["landing-hero__brand"]}
            aria-label={tHero("logoAriaLabel")}
          >
            <span
              className={styles["landing-hero__brand-mark"]}
              aria-hidden="true"
            >
              TN
            </span>
            <span className={styles["landing-hero__brand-name"]}>
              {PRODUCT_BRAND_NAME}
            </span>
          </div>
          <span className={styles["landing-hero__pill"]}>
            {tHero("brandPill")}
          </span>
          <Title
            variant="h1"
            className={styles["landing-hero__title"]}
            id={getAccessibilityId("landing-hero-title")}
          >
            {tHero("title")}
          </Title>
          <Text
            variant="body"
            className={styles["landing-hero__subtitle"]}
            aria-label={tHero("subtitle")}
          >
            {tHero("subtitle")}
          </Text>
          <ul className={styles["landing-hero__proofs"]}>
            {HERO_PROOF_KEYS.map((proofKey) => (
              <li key={proofKey} className={styles["landing-hero__proof"]}>
                {tHero(proofKey)}
              </li>
            ))}
          </ul>
          <div className={styles["landing-hero__actions"]}>
            <Link
              href={`${homePrefix}${AUTH_PAGE_ROUTES.SIGNUP}`}
              className={primaryCtaClassName}
              aria-label={tHero("ctaSignUp")}
            >
              {tHero("ctaSignUp")}
            </Link>
            <Link
              href={`${homePrefix}${AUTH_PAGE_ROUTES.SIGNIN}`}
              className={ghostCtaClassName}
              aria-label={tHero("ctaSignIn")}
            >
              {tHero("ctaSignIn")}
            </Link>
            <Link
              href={previewAnchor}
              className={secondaryCtaClassName}
              aria-label={tHero("ctaPreview")}
            >
              {tHero("ctaPreview")}
            </Link>
          </div>
        </div>
      </header>

      <div className={styles["landing-container"]}>
        <section
          className={styles["values-section"]}
          aria-labelledby={getAccessibilityId("landing-values-title")}
        >
          <Title
            variant="h2"
            className={styles["section-title"]}
            id={getAccessibilityId("landing-values-title")}
          >
            {tValues("title")}
          </Title>
          <ul className={styles["values-grid"]}>
            {VALUE_KEYS.map((key) => (
              <li key={key} className={styles["value-card"]}>
                <span className={styles["value-card__icon"]} aria-hidden="true">
                  {tValues(`${key}.icon`)}
                </span>
                <Title variant="h3">{tValues(`${key}.title`)}</Title>
                <Text variant="body">{tValues(`${key}.description`)}</Text>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={styles["features-section"]}
          aria-labelledby={getAccessibilityId("landing-features-title")}
        >
          <Title
            variant="h2"
            className={styles["section-title"]}
            id={getAccessibilityId("landing-features-title")}
          >
            {tFeatures("title")}
          </Title>
          <section
            id={getAccessibilityId("landing-example-preview")}
            className={styles["landing-example-preview"]}
            aria-labelledby={getAccessibilityId(
              "landing-example-preview-title"
            )}
          >
            <Title
              variant="h3"
              id={getAccessibilityId("landing-example-preview-title")}
              className={styles["landing-example-preview__title"]}
            >
              {tExamples("title")}
            </Title>
            <Text
              variant="body"
              className={styles["landing-example-preview__description"]}
            >
              {featurePreview.title} - {featurePreview.description}
            </Text>
            <div className={styles["landing-example-preview__surface"]}>
              <div className={styles["landing-example-preview__toolbar"]}>
                <span
                  className={styles["landing-example-preview__dot"]}
                  aria-hidden="true"
                />
                <span
                  className={styles["landing-example-preview__dot"]}
                  aria-hidden="true"
                />
                <span
                  className={styles["landing-example-preview__dot"]}
                  aria-hidden="true"
                />
                <span className={styles["landing-example-preview__app-name"]}>
                  {PRODUCT_BRAND_NAME}
                </span>
              </div>
              <ul className={styles["landing-example-preview__board"]}>
                {PREVIEW_COLUMNS.map((columnKey) => (
                  <li
                    key={columnKey}
                    className={styles["landing-example-preview__column"]}
                  >
                    <Title
                      variant="h4"
                      className={
                        styles["landing-example-preview__column-title"]
                      }
                    >
                      {tExamples(`columns.${columnKey}`)}
                    </Title>
                    <ul className={styles["landing-example-preview__items"]}>
                      {featurePreview.columns[columnKey].map((item) => (
                        <li
                          key={item}
                          className={styles["landing-example-preview__item"]}
                        >
                          <span
                            className={
                              styles["landing-example-preview__item-check"]
                            }
                            aria-hidden="true"
                          >
                            •
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </section>

        <section
          className={styles["impact-section"]}
          aria-labelledby={getAccessibilityId("landing-impact-title")}
        >
          <Title
            variant="h2"
            className={styles["section-title"]}
            id={getAccessibilityId("landing-impact-title")}
          >
            {tImpact("title")}
          </Title>
          <Text
            variant="body"
            className={styles["impact-section__description"]}
          >
            {tImpact("description")}
          </Text>
          <ul className={styles["impact-grid"]}>
            {IMPACT_KEYS.map((key) => (
              <li key={key} className={styles["impact-card"]}>
                <Text
                  variant="metric"
                  className={styles["impact-card__metric"]}
                >
                  {tImpact(`${key}.value`)}
                </Text>
                <Title variant="h3">{tImpact(`${key}.title`)}</Title>
                <Text variant="body">{tImpact(`${key}.description`)}</Text>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={styles["rhythm-section"]}
          aria-labelledby={getAccessibilityId("landing-rhythm-title")}
        >
          <Title
            variant="h2"
            className={styles["section-title"]}
            id={getAccessibilityId("landing-rhythm-title")}
          >
            {tRhythm("title")}
          </Title>
          <ul className={styles["rhythm-grid"]}>
            {RHYTHM_KEYS.map((key, index) => (
              <li key={key} className={styles["rhythm-card"]}>
                <div className={styles["rhythm-card__header"]}>
                  <span className={styles["rhythm-card__step"]}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={styles["rhythm-card__icon"]}
                    aria-hidden="true"
                  >
                    {tRhythm(`${key}.icon`)}
                  </span>
                </div>
                <Title variant="h3">{tRhythm(`${key}.title`)}</Title>
                <Text variant="body">{tRhythm(`${key}.description`)}</Text>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={styles["cta-section"]}
          aria-labelledby={getAccessibilityId("landing-cta-title")}
        >
          <Title
            variant="h2"
            className={styles["cta-section__title"]}
            id={getAccessibilityId("landing-cta-title")}
          >
            {tCta("title")}
          </Title>
          <Link
            href={`${homePrefix}${AUTH_PAGE_ROUTES.SIGNUP}`}
            className={getCtaClassName(
              primaryCtaClassName,
              styles["cta-section__button"]
            )}
            aria-label={tCta("button")}
          >
            {tCta("button")}
          </Link>
        </section>
      </div>

      <footer className={styles["landing-footer"]}>
        <nav
          className={styles["landing-footer__nav"]}
          aria-label={tFooter("ariaLabel")}
        >
          <Link href={legal} className={styles["landing-footer__link"]}>
            {tFooter("legal")}
          </Link>
        </nav>
      </footer>
    </main>
  );
};

export default Home;
