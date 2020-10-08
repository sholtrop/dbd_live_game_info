export function has<P extends PropertyKey>(
  target: object,
  property: P
): target is { [K in P]: unknown } {
  // The `in` operator throws a `TypeError` for non-object values.
  return property in target;
}

export function notNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function filterNull<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(notNull);
}

type AllNonNullable<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export function noNullVals<T extends { [index: string]: unknown }>(
  object: T
): object is AllNonNullable<T> {
  for (const val of Object.values(object))
    if (val === null || val === undefined) return false;

  return true;
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
