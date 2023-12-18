import {
  html, useState, useCallback, useEffect,
} from 'preact';

export default function ProductDetails(props) {
  const [value, setValue] = useState(0);
  const [product, setProduct] = useState(null);
  const increment = useCallback(() => {
    setValue(value + 1);
  }, [value]);

  useEffect(async () => {
    const result = await fetch('https://mock.shop/api', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        // eslint-disable-next-line no-use-before-define
        query: PRODUCT_QUERY,
        variables: {
          handle: 'men-crewneck',
          selectedOptions: [],
          language: 'EN',
          country: 'US',
        },
      }),
    });
    const productResult = await result.json();
    setProduct(productResult?.data?.product);
  }, []);

  return html`<div>
    My name is ${props.sku}.
    ${value}.
    <button onClick=${increment}>Increment</button>
    ${product && html`
    <h2>${product.title}</h2>
    <img src="${product.variants.nodes[0].image.url}" alt="${product.title}" />
    `}
    </div>`;
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
`;