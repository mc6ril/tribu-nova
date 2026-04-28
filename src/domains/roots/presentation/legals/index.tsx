import { getAccessibilityId } from "@/shared/a11y/constants";
import { GDPR_RIGHTS_KEYS, LEGAL_SECTIONS } from "@/shared/constants";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import BackButton from "@/shared/design-system/back_button";
import Text from "@/shared/design-system/text";
import Title from "@/shared/design-system/title";
import type { Locale } from "@/shared/i18n/config";
import { getStaticTranslator } from "@/shared/i18n/staticTranslator";

import styles from "./styles.module.scss";

type LegalPageProps = {
  locale: Locale;
};

const createNamespaceTranslationGetter = async (
  locale: Locale,
  namespace: string
) => {
  const t = getStaticTranslator(locale, namespace);
  return (key: string): string => t(key);
};

const LegalPage = async ({ locale }: LegalPageProps) => {
  const t = await createNamespaceTranslationGetter(locale, "pages.legal");

  return (
    <main className={styles["legal-page"]}>
      <header className={styles["legal-header"]}>
        <div className={styles["legal-header__content"]}>
          <BackButton
            label={t("header.label")}
            ariaLabel={t("header.label")}
            fallbackHref={`/${locale}${PAGE_ROUTES.HOME}`}
          />
          <div className={styles["legal-welcome"]}>
            <Title variant="h1" className={styles["legal-welcome__title"]}>
              {t("header.title")}
            </Title>
            <p className={styles["legal-welcome__subtitle"]}>
              {t("header.subtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className={styles["legal-container"]}>
        {LEGAL_SECTIONS.map(({ key, id }) => (
          <section
            key={key}
            className={styles["legal-section"]}
            aria-labelledby={getAccessibilityId(`${id}-title`)}
          >
            <div className={styles["section-header"]}>
              <div
                className={styles["section-header__icon"]}
                aria-hidden="true"
              >
                {t(`sections.${key}.icon`)}
              </div>
              <div>
                <Title
                  variant="h2"
                  id={getAccessibilityId(`${id}-title`)}
                  className={styles["section-title"]}
                >
                  {t(`sections.${key}.title`)}
                </Title>
                <p className={styles["section-description"]}>
                  {t(`sections.${key}.description`)}
                </p>
              </div>
            </div>

            <div className={styles["section-content"]}>
              {key === "editor" && (
                <div className={styles["legal-text"]}>
                  <Text variant="small">{t("sections.editor.appName")}</Text>
                  <Text variant="small">
                    {t("sections.editor.appDescription")}
                  </Text>
                  <Text variant="small">{t("sections.editor.contact")}</Text>
                  <Text variant="small">{t("sections.editor.hosting")}</Text>
                </div>
              )}

              {key === "intellectualProperty" && (
                <Text variant="small">
                  {t("sections.intellectualProperty.content")}
                </Text>
              )}

              {key === "dataProtection" && (
                <div className={styles["legal-text"]}>
                  <Text variant="small">
                    {t("sections.dataProtection.intro")}
                  </Text>
                  <ul className={styles["legal-list"]}>
                    {GDPR_RIGHTS_KEYS.map((right) => (
                      <li key={right}>
                        <Text variant="small">
                          {t(`sections.dataProtection.rights.${right}`)}
                        </Text>
                      </li>
                    ))}
                  </ul>
                  <Text variant="small">
                    {t("sections.dataProtection.collectedData")}
                  </Text>
                  <Text variant="small">
                    {t("sections.dataProtection.purpose")}
                  </Text>
                  <Text variant="small">
                    {t("sections.dataProtection.retention")}
                  </Text>
                  <Text variant="small">
                    {t("sections.dataProtection.exerciseRights")}
                  </Text>
                </div>
              )}

              {key === "cookies" && (
                <Text variant="small">{t("sections.cookies.content")}</Text>
              )}

              {key === "liability" && (
                <Text variant="small">{t("sections.liability.content")}</Text>
              )}

              {key === "applicableLaw" && (
                <Text variant="small">
                  {t("sections.applicableLaw.content")}
                </Text>
              )}
            </div>
          </section>
        ))}

        <div className={styles["legal-footer"]}>
          <Text variant="small">{t("lastUpdated")}</Text>
        </div>
      </div>
    </main>
  );
};

export default LegalPage;
