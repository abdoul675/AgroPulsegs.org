import type { Schema, Struct } from '@strapi/strapi';

export interface ContentCardGrid extends Struct.ComponentSchema {
  collectionName: 'agropulse_content_card_grid';
  info: {
    displayName: 'card-grid';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.service-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface ContentCta extends Struct.ComponentSchema {
  collectionName: 'agropulse_content_cta';
  info: {
    displayName: 'cta';
  };
  attributes: {
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String;
    path: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ContentHero extends Struct.ComponentSchema {
  collectionName: 'agropulse_content_hero';
  info: {
    displayName: 'hero';
  };
  attributes: {
    intro: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    visual: Schema.Attribute.Component<'shared.visual', false>;
  };
}

export interface ContentRichText extends Struct.ComponentSchema {
  collectionName: 'agropulse_content_rich_text';
  info: {
    displayName: 'rich-text';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    heading: Schema.Attribute.String;
  };
}

export interface SharedLocalizedText extends Struct.ComponentSchema {
  collectionName: 'agropulse_shared_localized_text';
  info: {
    displayName: 'localized-text';
  };
  attributes: {
    en: Schema.Attribute.Text;
    fr: Schema.Attribute.Text;
  };
}

export interface SharedNavigationItem extends Struct.ComponentSchema {
  collectionName: 'agropulse_shared_navigation_item';
  info: {
    displayName: 'navigation-item';
  };
  attributes: {
    label: Schema.Attribute.String;
    path: Schema.Attribute.String;
  };
}

export interface SharedPublicContact extends Struct.ComponentSchema {
  collectionName: 'agropulse_shared_public_contact';
  info: {
    displayName: 'public-contact';
  };
  attributes: {
    address: Schema.Attribute.Text;
    email: Schema.Attribute.Email;
    phone: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'agropulse_shared_seo';
  info: {
    displayName: 'seo';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedServiceItem extends Struct.ComponentSchema {
  collectionName: 'agropulse_shared_service_item';
  info: {
    displayName: 'service-item';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'agropulse_shared_social_link';
  info: {
    displayName: 'social-link';
  };
  attributes: {
    network: Schema.Attribute.Enumeration<
      ['linkedin', 'facebook', 'instagram', 'youtube']
    >;
    url: Schema.Attribute.String;
  };
}

export interface SharedVisual extends Struct.ComponentSchema {
  collectionName: 'agropulse_shared_visual';
  info: {
    displayName: 'visual';
  };
  attributes: {
    alt: Schema.Attribute.String;
    caption: Schema.Attribute.Text;
    kind: Schema.Attribute.Enumeration<['illustration', 'photo']>;
    media: Schema.Attribute.Media<'images'>;
    rightsConfirmed: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'content.card-grid': ContentCardGrid;
      'content.cta': ContentCta;
      'content.hero': ContentHero;
      'content.rich-text': ContentRichText;
      'shared.localized-text': SharedLocalizedText;
      'shared.navigation-item': SharedNavigationItem;
      'shared.public-contact': SharedPublicContact;
      'shared.seo': SharedSeo;
      'shared.service-item': SharedServiceItem;
      'shared.social-link': SharedSocialLink;
      'shared.visual': SharedVisual;
    }
  }
}
