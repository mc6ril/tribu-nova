"use client";

import { useLayoutEffect } from "react";

type DocumentLangProps = {
  lang: string;
};

const DocumentLang = ({ lang }: DocumentLangProps) => {
  useLayoutEffect(() => {
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return null;
};

export default DocumentLang;
