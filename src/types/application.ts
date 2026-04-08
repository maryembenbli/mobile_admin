export type ApplicationIntegrationCategory =
  | "marketing"
  | "analytics"
  | "commerce"
  | "security"
  | "messaging";

export type ApplicationIntegration = {
  id: string;
  name: string;
  category: ApplicationIntegrationCategory;
  accent: string;
  textColor: string;
  description: string;
};

export type ApplicationConfig = {
  enabled: boolean;
  values: Record<string, string | boolean | string[]>;
};
