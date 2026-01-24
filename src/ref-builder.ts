export class RefBuilder {
  private path: string[] = [];

  constructor(base: string = "#") {
    this.addBase(base);
  }

  addBase(base: string) {
    if (base.startsWith("#")) {
      this.path[0] = base;
    } else {
      if (base.endsWith("#")) {
        this.path[0] = base;
      } else {
        this.path[0] = base + "#";
      }
    }
  }

  reset(): this {
    const base = this.path[0];
    this.path = [base];
    return this;
  }

  extend(): RefBuilder {
    const extended = new RefBuilder();
    extended.path = [...this.path];
    return extended;
  }

  base(base: string): this {
    this.addBase(base);
    return this;
  }
  properties(prop: string): this {
    this.path.push("properties", prop);
    return this;
  }

  patternProperties(pattern: string): this {
    this.path.push("patternProperties", pattern);
    return this;
  }

  additionalProperties(): this {
    this.path.push("additionalProperties");
    return this;
  }

  unevaluatedProperties(): this {
    this.path.push("unevaluatedProperties");
    return this;
  }

  propertyNames(): this {
    this.path.push("propertyNames");
    return this;
  }

  dependentSchemas(prop: string): this {
    this.path.push("dependentSchemas", prop);
    return this;
  }

  dependencies(prop: string): this {
    this.path.push("dependencies", prop);
    return this;
  }

  items(index?: number): this {
    this.path.push("items");
    if (index !== undefined) this.path.push(String(index));
    return this;
  }

  prefixItems(index: number): this {
    this.path.push("prefixItems", String(index));
    return this;
  }

  additionalItems(): this {
    this.path.push("additionalItems");
    return this;
  }

  unevaluatedItems(): this {
    this.path.push("unevaluatedItems");
    return this;
  }

  contains(): this {
    this.path.push("contains");
    return this;
  }

  allOf(index: number): this {
    this.path.push("allOf", String(index));
    return this;
  }

  anyOf(index: number): this {
    this.path.push("anyOf", String(index));
    return this;
  }

  oneOf(index: number): this {
    this.path.push("oneOf", String(index));
    return this;
  }

  not(): this {
    this.path.push("not");
    return this;
  }

  if(): this {
    this.path.push("if");
    return this;
  }

  then(): this {
    this.path.push("then");
    return this;
  }

  else(): this {
    this.path.push("else");
    return this;
  }

  elseIf(index: number): this {
    this.path.push("elseIf", String(index));
    return this;
  }

  $defs(def: string): this {
    this.path.push("$defs", def);
    return this;
  }

  definitions(def: string): this {
    this.path.push("definitions", def);
    return this;
  }

  anchor(name: string): this {
    const base = this.path[0];
    if (name.startsWith("#")) {
      this.path = [base + name.slice(1)];
    } else {
      this.path = [base + name];
    }
    return this;
  }

  dynamicAnchor(name: string): this {
    const base = this.path[0];
    if (name.startsWith("#")) {
      this.path = [base + name.slice(1)];
    } else {
      this.path = [base + name];
    }
    return this;
  }

  segment(segment: string): this {
    this.path.push(segment);
    return this;
  }

  chain(): this {
    return this;
  }

  build(): string {
    return this.path.join("/");
  }

  toString(): string {
    return this.build();
  }
}
