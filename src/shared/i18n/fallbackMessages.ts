import type { Locale } from "./config";

type FallbackActionCopy = {
  primaryAction: string;
  primaryActionAriaLabel: string;
  secondaryAction: string;
  secondaryActionAriaLabel: string;
};

type FallbackScreenCopy = FallbackActionCopy & {
  eyebrow: string;
  status: string;
  title: string;
  message: string;
};

type FallbackMessages = {
  error: FallbackScreenCopy;
  globalError: FallbackScreenCopy;
  notFound: FallbackScreenCopy;
};

const fallbackMessagesByLocale: Record<Locale, FallbackMessages> = {
  fr: {
    notFound: {
      eyebrow: "Page introuvable",
      status: "404",
      title: "Cette page a pris la tangente",
      message:
        "Le lien est peut-etre ancien, incomplet ou deja obsolete. On peut repartir d'un endroit plus sur.",
      primaryAction: "Revenir a l'accueil",
      primaryActionAriaLabel: "Revenir a la page d'accueil",
      secondaryAction: "Aller a l'espace de travail",
      secondaryActionAriaLabel: "Aller a l'espace de travail",
    },
    error: {
      eyebrow: "Incident temporaire",
      status: "Erreur",
      title: "Quelque chose a derape",
      message:
        "L'ecran n'a pas pu se charger correctement. Vous pouvez reessayer sans perdre votre session.",
      primaryAction: "Reessayer",
      primaryActionAriaLabel: "Reessayer de charger la page",
      secondaryAction: "Retour a l'accueil",
      secondaryActionAriaLabel: "Revenir a la page d'accueil",
    },
    globalError: {
      eyebrow: "Incident global",
      status: "Erreur critique",
      title: "On a perdu le fil",
      message:
        "L'application n'a pas reussi a retablir cet ecran. Un nouveau chargement suffit souvent a repartir proprement.",
      primaryAction: "Relancer",
      primaryActionAriaLabel: "Relancer l'application",
      secondaryAction: "Retour a l'accueil",
      secondaryActionAriaLabel: "Revenir a la page d'accueil",
    },
  },
  en: {
    notFound: {
      eyebrow: "Page not found",
      status: "404",
      title: "This page slipped away",
      message:
        "The link may be outdated, incomplete, or already obsolete. We can get you back somewhere safer.",
      primaryAction: "Back to home",
      primaryActionAriaLabel: "Return to the home page",
      secondaryAction: "Go to workspace",
      secondaryActionAriaLabel: "Go to the workspace",
    },
    error: {
      eyebrow: "Temporary incident",
      status: "Error",
      title: "Something went off track",
      message:
        "This screen could not load properly. You can try again without losing your current session.",
      primaryAction: "Try again",
      primaryActionAriaLabel: "Try loading the page again",
      secondaryAction: "Back to home",
      secondaryActionAriaLabel: "Return to the home page",
    },
    globalError: {
      eyebrow: "Global incident",
      status: "Critical error",
      title: "We lost the thread",
      message:
        "The app could not recover this screen. A fresh restart is often enough to get back on track.",
      primaryAction: "Restart",
      primaryActionAriaLabel: "Restart the application",
      secondaryAction: "Back to home",
      secondaryActionAriaLabel: "Return to the home page",
    },
  },
  es: {
    notFound: {
      eyebrow: "Pagina no encontrada",
      status: "404",
      title: "Esta pagina se nos escapo",
      message:
        "El enlace puede estar desactualizado, incompleto o ya obsoleto. Podemos llevarte de vuelta a un lugar mas seguro.",
      primaryAction: "Volver al inicio",
      primaryActionAriaLabel: "Volver a la pagina de inicio",
      secondaryAction: "Ir al espacio de trabajo",
      secondaryActionAriaLabel: "Ir al espacio de trabajo",
    },
    error: {
      eyebrow: "Incidente temporal",
      status: "Error",
      title: "Algo se desvio",
      message:
        "Esta pantalla no pudo cargarse correctamente. Puedes intentarlo de nuevo sin perder tu sesion.",
      primaryAction: "Reintentar",
      primaryActionAriaLabel: "Intentar cargar la pagina de nuevo",
      secondaryAction: "Volver al inicio",
      secondaryActionAriaLabel: "Volver a la pagina de inicio",
    },
    globalError: {
      eyebrow: "Incidente global",
      status: "Error critico",
      title: "Perdimos el hilo",
      message:
        "La aplicacion no pudo recuperar esta pantalla. Un reinicio limpio suele bastar para volver a empezar.",
      primaryAction: "Reiniciar",
      primaryActionAriaLabel: "Reiniciar la aplicacion",
      secondaryAction: "Volver al inicio",
      secondaryActionAriaLabel: "Volver a la pagina de inicio",
    },
  },
};

export const getFallbackMessages = (locale: Locale): FallbackMessages => {
  return fallbackMessagesByLocale[locale];
};
