import So, { app as ir, BrowserWindow as ko, ipcMain as Qr, Menu as ha } from "electron";
import { fileURLToPath as xl } from "url";
import pe from "path";
import Je from "fs";
import $n from "assert";
import xo from "events";
import In from "util";
import Rl from "https";
import Ro from "stream";
import Oo from "buffer";
var ve = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, le = {}, gn = { exports: {} };
const Ol = "2.0.0", To = 256, Tl = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Al = 16, $l = To - 6, Il = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ei = {
  MAX_LENGTH: To,
  MAX_SAFE_COMPONENT_LENGTH: Al,
  MAX_SAFE_BUILD_LENGTH: $l,
  MAX_SAFE_INTEGER: Tl,
  RELEASE_TYPES: Il,
  SEMVER_SPEC_VERSION: Ol,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Cl = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var ti = Cl;
(function(e, r) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: t,
    MAX_SAFE_BUILD_LENGTH: i,
    MAX_LENGTH: n
  } = ei, a = ti;
  r = e.exports = {};
  const s = r.re = [], f = r.safeRe = [], c = r.src = [], o = r.t = {};
  let d = 0;
  const m = "[a-zA-Z0-9-]", u = [
    ["\\s", 1],
    ["\\d", n],
    [m, i]
  ], h = (v) => {
    for (const [x, l] of u)
      v = v.split(`${x}*`).join(`${x}{0,${l}}`).split(`${x}+`).join(`${x}{1,${l}}`);
    return v;
  }, p = (v, x, l) => {
    const _ = h(x), R = d++;
    a(v, R, x), o[v] = R, c[R] = x, s[R] = new RegExp(x, l ? "g" : void 0), f[R] = new RegExp(_, l ? "g" : void 0);
  };
  p("NUMERICIDENTIFIER", "0|[1-9]\\d*"), p("NUMERICIDENTIFIERLOOSE", "\\d+"), p("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${m}*`), p("MAINVERSION", `(${c[o.NUMERICIDENTIFIER]})\\.(${c[o.NUMERICIDENTIFIER]})\\.(${c[o.NUMERICIDENTIFIER]})`), p("MAINVERSIONLOOSE", `(${c[o.NUMERICIDENTIFIERLOOSE]})\\.(${c[o.NUMERICIDENTIFIERLOOSE]})\\.(${c[o.NUMERICIDENTIFIERLOOSE]})`), p("PRERELEASEIDENTIFIER", `(?:${c[o.NUMERICIDENTIFIER]}|${c[o.NONNUMERICIDENTIFIER]})`), p("PRERELEASEIDENTIFIERLOOSE", `(?:${c[o.NUMERICIDENTIFIERLOOSE]}|${c[o.NONNUMERICIDENTIFIER]})`), p("PRERELEASE", `(?:-(${c[o.PRERELEASEIDENTIFIER]}(?:\\.${c[o.PRERELEASEIDENTIFIER]})*))`), p("PRERELEASELOOSE", `(?:-?(${c[o.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[o.PRERELEASEIDENTIFIERLOOSE]})*))`), p("BUILDIDENTIFIER", `${m}+`), p("BUILD", `(?:\\+(${c[o.BUILDIDENTIFIER]}(?:\\.${c[o.BUILDIDENTIFIER]})*))`), p("FULLPLAIN", `v?${c[o.MAINVERSION]}${c[o.PRERELEASE]}?${c[o.BUILD]}?`), p("FULL", `^${c[o.FULLPLAIN]}$`), p("LOOSEPLAIN", `[v=\\s]*${c[o.MAINVERSIONLOOSE]}${c[o.PRERELEASELOOSE]}?${c[o.BUILD]}?`), p("LOOSE", `^${c[o.LOOSEPLAIN]}$`), p("GTLT", "((?:<|>)?=?)"), p("XRANGEIDENTIFIERLOOSE", `${c[o.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), p("XRANGEIDENTIFIER", `${c[o.NUMERICIDENTIFIER]}|x|X|\\*`), p("XRANGEPLAIN", `[v=\\s]*(${c[o.XRANGEIDENTIFIER]})(?:\\.(${c[o.XRANGEIDENTIFIER]})(?:\\.(${c[o.XRANGEIDENTIFIER]})(?:${c[o.PRERELEASE]})?${c[o.BUILD]}?)?)?`), p("XRANGEPLAINLOOSE", `[v=\\s]*(${c[o.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[o.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[o.XRANGEIDENTIFIERLOOSE]})(?:${c[o.PRERELEASELOOSE]})?${c[o.BUILD]}?)?)?`), p("XRANGE", `^${c[o.GTLT]}\\s*${c[o.XRANGEPLAIN]}$`), p("XRANGELOOSE", `^${c[o.GTLT]}\\s*${c[o.XRANGEPLAINLOOSE]}$`), p("COERCEPLAIN", `(^|[^\\d])(\\d{1,${t}})(?:\\.(\\d{1,${t}}))?(?:\\.(\\d{1,${t}}))?`), p("COERCE", `${c[o.COERCEPLAIN]}(?:$|[^\\d])`), p("COERCEFULL", c[o.COERCEPLAIN] + `(?:${c[o.PRERELEASE]})?(?:${c[o.BUILD]})?(?:$|[^\\d])`), p("COERCERTL", c[o.COERCE], !0), p("COERCERTLFULL", c[o.COERCEFULL], !0), p("LONETILDE", "(?:~>?)"), p("TILDETRIM", `(\\s*)${c[o.LONETILDE]}\\s+`, !0), r.tildeTrimReplace = "$1~", p("TILDE", `^${c[o.LONETILDE]}${c[o.XRANGEPLAIN]}$`), p("TILDELOOSE", `^${c[o.LONETILDE]}${c[o.XRANGEPLAINLOOSE]}$`), p("LONECARET", "(?:\\^)"), p("CARETTRIM", `(\\s*)${c[o.LONECARET]}\\s+`, !0), r.caretTrimReplace = "$1^", p("CARET", `^${c[o.LONECARET]}${c[o.XRANGEPLAIN]}$`), p("CARETLOOSE", `^${c[o.LONECARET]}${c[o.XRANGEPLAINLOOSE]}$`), p("COMPARATORLOOSE", `^${c[o.GTLT]}\\s*(${c[o.LOOSEPLAIN]})$|^$`), p("COMPARATOR", `^${c[o.GTLT]}\\s*(${c[o.FULLPLAIN]})$|^$`), p("COMPARATORTRIM", `(\\s*)${c[o.GTLT]}\\s*(${c[o.LOOSEPLAIN]}|${c[o.XRANGEPLAIN]})`, !0), r.comparatorTrimReplace = "$1$2$3", p("HYPHENRANGE", `^\\s*(${c[o.XRANGEPLAIN]})\\s+-\\s+(${c[o.XRANGEPLAIN]})\\s*$`), p("HYPHENRANGELOOSE", `^\\s*(${c[o.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[o.XRANGEPLAINLOOSE]})\\s*$`), p("STAR", "(<|>)?=?\\s*\\*"), p("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), p("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(gn, gn.exports);
var ur = gn.exports;
const Nl = Object.freeze({ loose: !0 }), Ll = Object.freeze({}), Dl = (e) => e ? typeof e != "object" ? Nl : e : Ll;
var Cn = Dl;
const da = /^[0-9]+$/, Ao = (e, r) => {
  const t = da.test(e), i = da.test(r);
  return t && i && (e = +e, r = +r), e === r ? 0 : t && !i ? -1 : i && !t ? 1 : e < r ? -1 : 1;
}, Pl = (e, r) => Ao(r, e);
var $o = {
  compareIdentifiers: Ao,
  rcompareIdentifiers: Pl
};
const mr = ti, { MAX_LENGTH: va, MAX_SAFE_INTEGER: yr } = ei, { safeRe: pa, t: _a } = ur, jl = Cn, { compareIdentifiers: St } = $o;
let Fl = class Me {
  constructor(r, t) {
    if (t = jl(t), r instanceof Me) {
      if (r.loose === !!t.loose && r.includePrerelease === !!t.includePrerelease)
        return r;
      r = r.version;
    } else if (typeof r != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof r}".`);
    if (r.length > va)
      throw new TypeError(
        `version is longer than ${va} characters`
      );
    mr("SemVer", r, t), this.options = t, this.loose = !!t.loose, this.includePrerelease = !!t.includePrerelease;
    const i = r.trim().match(t.loose ? pa[_a.LOOSE] : pa[_a.FULL]);
    if (!i)
      throw new TypeError(`Invalid Version: ${r}`);
    if (this.raw = r, this.major = +i[1], this.minor = +i[2], this.patch = +i[3], this.major > yr || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > yr || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > yr || this.patch < 0)
      throw new TypeError("Invalid patch version");
    i[4] ? this.prerelease = i[4].split(".").map((n) => {
      if (/^[0-9]+$/.test(n)) {
        const a = +n;
        if (a >= 0 && a < yr)
          return a;
      }
      return n;
    }) : this.prerelease = [], this.build = i[5] ? i[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(r) {
    if (mr("SemVer.compare", this.version, this.options, r), !(r instanceof Me)) {
      if (typeof r == "string" && r === this.version)
        return 0;
      r = new Me(r, this.options);
    }
    return r.version === this.version ? 0 : this.compareMain(r) || this.comparePre(r);
  }
  compareMain(r) {
    return r instanceof Me || (r = new Me(r, this.options)), St(this.major, r.major) || St(this.minor, r.minor) || St(this.patch, r.patch);
  }
  comparePre(r) {
    if (r instanceof Me || (r = new Me(r, this.options)), this.prerelease.length && !r.prerelease.length)
      return -1;
    if (!this.prerelease.length && r.prerelease.length)
      return 1;
    if (!this.prerelease.length && !r.prerelease.length)
      return 0;
    let t = 0;
    do {
      const i = this.prerelease[t], n = r.prerelease[t];
      if (mr("prerelease compare", t, i, n), i === void 0 && n === void 0)
        return 0;
      if (n === void 0)
        return 1;
      if (i === void 0)
        return -1;
      if (i === n)
        continue;
      return St(i, n);
    } while (++t);
  }
  compareBuild(r) {
    r instanceof Me || (r = new Me(r, this.options));
    let t = 0;
    do {
      const i = this.build[t], n = r.build[t];
      if (mr("build compare", t, i, n), i === void 0 && n === void 0)
        return 0;
      if (n === void 0)
        return 1;
      if (i === void 0)
        return -1;
      if (i === n)
        continue;
      return St(i, n);
    } while (++t);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(r, t, i) {
    switch (r) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", t, i);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", t, i);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", t, i), this.inc("pre", t, i);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", t, i), this.inc("pre", t, i);
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const n = Number(i) ? 1 : 0;
        if (!t && i === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (this.prerelease.length === 0)
          this.prerelease = [n];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (t === this.prerelease.join(".") && i === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(n);
          }
        }
        if (t) {
          let a = [t, n];
          i === !1 && (a = [t]), St(this.prerelease[0], t) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${r}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var ye = Fl;
const ga = ye, Bl = (e, r, t = !1) => {
  if (e instanceof ga)
    return e;
  try {
    return new ga(e, r);
  } catch (i) {
    if (!t)
      return null;
    throw i;
  }
};
var Dt = Bl;
const Ml = Dt, Ul = (e, r) => {
  const t = Ml(e, r);
  return t ? t.version : null;
};
var zl = Ul;
const Gl = Dt, Zl = (e, r) => {
  const t = Gl(e.trim().replace(/^[=v]+/, ""), r);
  return t ? t.version : null;
};
var Wl = Zl;
const ma = ye, ql = (e, r, t, i, n) => {
  typeof t == "string" && (n = i, i = t, t = void 0);
  try {
    return new ma(
      e instanceof ma ? e.version : e,
      t
    ).inc(r, i, n).version;
  } catch {
    return null;
  }
};
var Hl = ql;
const ya = Dt, Vl = (e, r) => {
  const t = ya(e, null, !0), i = ya(r, null, !0), n = t.compare(i);
  if (n === 0)
    return null;
  const a = n > 0, s = a ? t : i, f = a ? i : t, c = !!s.prerelease.length;
  if (!!f.prerelease.length && !c)
    return !f.patch && !f.minor ? "major" : s.patch ? "patch" : s.minor ? "minor" : "major";
  const d = c ? "pre" : "";
  return t.major !== i.major ? d + "major" : t.minor !== i.minor ? d + "minor" : t.patch !== i.patch ? d + "patch" : "prerelease";
};
var Xl = Vl;
const Yl = ye, Kl = (e, r) => new Yl(e, r).major;
var Jl = Kl;
const Ql = ye, eu = (e, r) => new Ql(e, r).minor;
var tu = eu;
const ru = ye, iu = (e, r) => new ru(e, r).patch;
var nu = iu;
const au = Dt, su = (e, r) => {
  const t = au(e, r);
  return t && t.prerelease.length ? t.prerelease : null;
};
var ou = su;
const wa = ye, fu = (e, r, t) => new wa(e, t).compare(new wa(r, t));
var Ne = fu;
const lu = Ne, uu = (e, r, t) => lu(r, e, t);
var cu = uu;
const hu = Ne, du = (e, r) => hu(e, r, !0);
var vu = du;
const Ea = ye, pu = (e, r, t) => {
  const i = new Ea(e, t), n = new Ea(r, t);
  return i.compare(n) || i.compareBuild(n);
};
var Nn = pu;
const _u = Nn, gu = (e, r) => e.sort((t, i) => _u(t, i, r));
var mu = gu;
const yu = Nn, wu = (e, r) => e.sort((t, i) => yu(i, t, r));
var Eu = wu;
const bu = Ne, Su = (e, r, t) => bu(e, r, t) > 0;
var ri = Su;
const ku = Ne, xu = (e, r, t) => ku(e, r, t) < 0;
var Ln = xu;
const Ru = Ne, Ou = (e, r, t) => Ru(e, r, t) === 0;
var Io = Ou;
const Tu = Ne, Au = (e, r, t) => Tu(e, r, t) !== 0;
var Co = Au;
const $u = Ne, Iu = (e, r, t) => $u(e, r, t) >= 0;
var Dn = Iu;
const Cu = Ne, Nu = (e, r, t) => Cu(e, r, t) <= 0;
var Pn = Nu;
const Lu = Io, Du = Co, Pu = ri, ju = Dn, Fu = Ln, Bu = Pn, Mu = (e, r, t, i) => {
  switch (r) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof t == "object" && (t = t.version), e === t;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof t == "object" && (t = t.version), e !== t;
    case "":
    case "=":
    case "==":
      return Lu(e, t, i);
    case "!=":
      return Du(e, t, i);
    case ">":
      return Pu(e, t, i);
    case ">=":
      return ju(e, t, i);
    case "<":
      return Fu(e, t, i);
    case "<=":
      return Bu(e, t, i);
    default:
      throw new TypeError(`Invalid operator: ${r}`);
  }
};
var No = Mu;
const Uu = ye, zu = Dt, { safeRe: wr, t: Er } = ur, Gu = (e, r) => {
  if (e instanceof Uu)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  r = r || {};
  let t = null;
  if (!r.rtl)
    t = e.match(r.includePrerelease ? wr[Er.COERCEFULL] : wr[Er.COERCE]);
  else {
    const c = r.includePrerelease ? wr[Er.COERCERTLFULL] : wr[Er.COERCERTL];
    let o;
    for (; (o = c.exec(e)) && (!t || t.index + t[0].length !== e.length); )
      (!t || o.index + o[0].length !== t.index + t[0].length) && (t = o), c.lastIndex = o.index + o[1].length + o[2].length;
    c.lastIndex = -1;
  }
  if (t === null)
    return null;
  const i = t[2], n = t[3] || "0", a = t[4] || "0", s = r.includePrerelease && t[5] ? `-${t[5]}` : "", f = r.includePrerelease && t[6] ? `+${t[6]}` : "";
  return zu(`${i}.${n}.${a}${s}${f}`, r);
};
var Zu = Gu;
class Wu {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(r) {
    const t = this.map.get(r);
    if (t !== void 0)
      return this.map.delete(r), this.map.set(r, t), t;
  }
  delete(r) {
    return this.map.delete(r);
  }
  set(r, t) {
    if (!this.delete(r) && t !== void 0) {
      if (this.map.size >= this.max) {
        const n = this.map.keys().next().value;
        this.delete(n);
      }
      this.map.set(r, t);
    }
    return this;
  }
}
var qu = Wu, gi, ba;
function Le() {
  if (ba) return gi;
  ba = 1;
  const e = /\s+/g;
  class r {
    constructor(P, G) {
      if (G = n(G), P instanceof r)
        return P.loose === !!G.loose && P.includePrerelease === !!G.includePrerelease ? P : new r(P.raw, G);
      if (P instanceof a)
        return this.raw = P.value, this.set = [[P]], this.formatted = void 0, this;
      if (this.options = G, this.loose = !!G.loose, this.includePrerelease = !!G.includePrerelease, this.raw = P.trim().replace(e, " "), this.set = this.raw.split("||").map((w) => this.parseRange(w.trim())).filter((w) => w.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const w = this.set[0];
        if (this.set = this.set.filter((S) => !v(S[0])), this.set.length === 0)
          this.set = [w];
        else if (this.set.length > 1) {
          for (const S of this.set)
            if (S.length === 1 && x(S[0])) {
              this.set = [S];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let P = 0; P < this.set.length; P++) {
          P > 0 && (this.formatted += "||");
          const G = this.set[P];
          for (let w = 0; w < G.length; w++)
            w > 0 && (this.formatted += " "), this.formatted += G[w].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(P) {
      const w = ((this.options.includePrerelease && h) | (this.options.loose && p)) + ":" + P, S = i.get(w);
      if (S)
        return S;
      const C = this.options.loose, j = C ? c[o.HYPHENRANGELOOSE] : c[o.HYPHENRANGE];
      P = P.replace(j, L(this.options.includePrerelease)), s("hyphen replace", P), P = P.replace(c[o.COMPARATORTRIM], d), s("comparator trim", P), P = P.replace(c[o.TILDETRIM], m), s("tilde trim", P), P = P.replace(c[o.CARETTRIM], u), s("caret trim", P);
      let U = P.split(" ").map((Q) => _(Q, this.options)).join(" ").split(/\s+/).map((Q) => O(Q, this.options));
      C && (U = U.filter((Q) => (s("loose invalid filter", Q, this.options), !!Q.match(c[o.COMPARATORLOOSE])))), s("range list", U);
      const Z = /* @__PURE__ */ new Map(), H = U.map((Q) => new a(Q, this.options));
      for (const Q of H) {
        if (v(Q))
          return [Q];
        Z.set(Q.value, Q);
      }
      Z.size > 1 && Z.has("") && Z.delete("");
      const X = [...Z.values()];
      return i.set(w, X), X;
    }
    intersects(P, G) {
      if (!(P instanceof r))
        throw new TypeError("a Range is required");
      return this.set.some((w) => l(w, G) && P.set.some((S) => l(S, G) && w.every((C) => S.every((j) => C.intersects(j, G)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(P) {
      if (!P)
        return !1;
      if (typeof P == "string")
        try {
          P = new f(P, this.options);
        } catch {
          return !1;
        }
      for (let G = 0; G < this.set.length; G++)
        if (B(this.set[G], P, this.options))
          return !0;
      return !1;
    }
  }
  gi = r;
  const t = qu, i = new t(), n = Cn, a = ii(), s = ti, f = ye, {
    safeRe: c,
    t: o,
    comparatorTrimReplace: d,
    tildeTrimReplace: m,
    caretTrimReplace: u
  } = ur, { FLAG_INCLUDE_PRERELEASE: h, FLAG_LOOSE: p } = ei, v = (N) => N.value === "<0.0.0-0", x = (N) => N.value === "", l = (N, P) => {
    let G = !0;
    const w = N.slice();
    let S = w.pop();
    for (; G && w.length; )
      G = w.every((C) => S.intersects(C, P)), S = w.pop();
    return G;
  }, _ = (N, P) => (s("comp", N, P), N = $(N, P), s("caret", N), N = g(N, P), s("tildes", N), N = T(N, P), s("xrange", N), N = I(N, P), s("stars", N), N), R = (N) => !N || N.toLowerCase() === "x" || N === "*", g = (N, P) => N.trim().split(/\s+/).map((G) => E(G, P)).join(" "), E = (N, P) => {
    const G = P.loose ? c[o.TILDELOOSE] : c[o.TILDE];
    return N.replace(G, (w, S, C, j, U) => {
      s("tilde", N, w, S, C, j, U);
      let Z;
      return R(S) ? Z = "" : R(C) ? Z = `>=${S}.0.0 <${+S + 1}.0.0-0` : R(j) ? Z = `>=${S}.${C}.0 <${S}.${+C + 1}.0-0` : U ? (s("replaceTilde pr", U), Z = `>=${S}.${C}.${j}-${U} <${S}.${+C + 1}.0-0`) : Z = `>=${S}.${C}.${j} <${S}.${+C + 1}.0-0`, s("tilde return", Z), Z;
    });
  }, $ = (N, P) => N.trim().split(/\s+/).map((G) => A(G, P)).join(" "), A = (N, P) => {
    s("caret", N, P);
    const G = P.loose ? c[o.CARETLOOSE] : c[o.CARET], w = P.includePrerelease ? "-0" : "";
    return N.replace(G, (S, C, j, U, Z) => {
      s("caret", N, S, C, j, U, Z);
      let H;
      return R(C) ? H = "" : R(j) ? H = `>=${C}.0.0${w} <${+C + 1}.0.0-0` : R(U) ? C === "0" ? H = `>=${C}.${j}.0${w} <${C}.${+j + 1}.0-0` : H = `>=${C}.${j}.0${w} <${+C + 1}.0.0-0` : Z ? (s("replaceCaret pr", Z), C === "0" ? j === "0" ? H = `>=${C}.${j}.${U}-${Z} <${C}.${j}.${+U + 1}-0` : H = `>=${C}.${j}.${U}-${Z} <${C}.${+j + 1}.0-0` : H = `>=${C}.${j}.${U}-${Z} <${+C + 1}.0.0-0`) : (s("no pr"), C === "0" ? j === "0" ? H = `>=${C}.${j}.${U}${w} <${C}.${j}.${+U + 1}-0` : H = `>=${C}.${j}.${U}${w} <${C}.${+j + 1}.0-0` : H = `>=${C}.${j}.${U} <${+C + 1}.0.0-0`), s("caret return", H), H;
    });
  }, T = (N, P) => (s("replaceXRanges", N, P), N.split(/\s+/).map((G) => b(G, P)).join(" ")), b = (N, P) => {
    N = N.trim();
    const G = P.loose ? c[o.XRANGELOOSE] : c[o.XRANGE];
    return N.replace(G, (w, S, C, j, U, Z) => {
      s("xRange", N, w, S, C, j, U, Z);
      const H = R(C), X = H || R(j), Q = X || R(U), Y = Q;
      return S === "=" && Y && (S = ""), Z = P.includePrerelease ? "-0" : "", H ? S === ">" || S === "<" ? w = "<0.0.0-0" : w = "*" : S && Y ? (X && (j = 0), U = 0, S === ">" ? (S = ">=", X ? (C = +C + 1, j = 0, U = 0) : (j = +j + 1, U = 0)) : S === "<=" && (S = "<", X ? C = +C + 1 : j = +j + 1), S === "<" && (Z = "-0"), w = `${S + C}.${j}.${U}${Z}`) : X ? w = `>=${C}.0.0${Z} <${+C + 1}.0.0-0` : Q && (w = `>=${C}.${j}.0${Z} <${C}.${+j + 1}.0-0`), s("xRange return", w), w;
    });
  }, I = (N, P) => (s("replaceStars", N, P), N.trim().replace(c[o.STAR], "")), O = (N, P) => (s("replaceGTE0", N, P), N.trim().replace(c[P.includePrerelease ? o.GTE0PRE : o.GTE0], "")), L = (N) => (P, G, w, S, C, j, U, Z, H, X, Q, Y) => (R(w) ? G = "" : R(S) ? G = `>=${w}.0.0${N ? "-0" : ""}` : R(C) ? G = `>=${w}.${S}.0${N ? "-0" : ""}` : j ? G = `>=${G}` : G = `>=${G}${N ? "-0" : ""}`, R(H) ? Z = "" : R(X) ? Z = `<${+H + 1}.0.0-0` : R(Q) ? Z = `<${H}.${+X + 1}.0-0` : Y ? Z = `<=${H}.${X}.${Q}-${Y}` : N ? Z = `<${H}.${X}.${+Q + 1}-0` : Z = `<=${Z}`, `${G} ${Z}`.trim()), B = (N, P, G) => {
    for (let w = 0; w < N.length; w++)
      if (!N[w].test(P))
        return !1;
    if (P.prerelease.length && !G.includePrerelease) {
      for (let w = 0; w < N.length; w++)
        if (s(N[w].semver), N[w].semver !== a.ANY && N[w].semver.prerelease.length > 0) {
          const S = N[w].semver;
          if (S.major === P.major && S.minor === P.minor && S.patch === P.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return gi;
}
var mi, Sa;
function ii() {
  if (Sa) return mi;
  Sa = 1;
  const e = Symbol("SemVer ANY");
  class r {
    static get ANY() {
      return e;
    }
    constructor(d, m) {
      if (m = t(m), d instanceof r) {
        if (d.loose === !!m.loose)
          return d;
        d = d.value;
      }
      d = d.trim().split(/\s+/).join(" "), s("comparator", d, m), this.options = m, this.loose = !!m.loose, this.parse(d), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(d) {
      const m = this.options.loose ? i[n.COMPARATORLOOSE] : i[n.COMPARATOR], u = d.match(m);
      if (!u)
        throw new TypeError(`Invalid comparator: ${d}`);
      this.operator = u[1] !== void 0 ? u[1] : "", this.operator === "=" && (this.operator = ""), u[2] ? this.semver = new f(u[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(d) {
      if (s("Comparator.test", d, this.options.loose), this.semver === e || d === e)
        return !0;
      if (typeof d == "string")
        try {
          d = new f(d, this.options);
        } catch {
          return !1;
        }
      return a(d, this.operator, this.semver, this.options);
    }
    intersects(d, m) {
      if (!(d instanceof r))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new c(d.value, m).test(this.value) : d.operator === "" ? d.value === "" ? !0 : new c(this.value, m).test(d.semver) : (m = t(m), m.includePrerelease && (this.value === "<0.0.0-0" || d.value === "<0.0.0-0") || !m.includePrerelease && (this.value.startsWith("<0.0.0") || d.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && d.operator.startsWith(">") || this.operator.startsWith("<") && d.operator.startsWith("<") || this.semver.version === d.semver.version && this.operator.includes("=") && d.operator.includes("=") || a(this.semver, "<", d.semver, m) && this.operator.startsWith(">") && d.operator.startsWith("<") || a(this.semver, ">", d.semver, m) && this.operator.startsWith("<") && d.operator.startsWith(">")));
    }
  }
  mi = r;
  const t = Cn, { safeRe: i, t: n } = ur, a = No, s = ti, f = ye, c = Le();
  return mi;
}
const Hu = Le(), Vu = (e, r, t) => {
  try {
    r = new Hu(r, t);
  } catch {
    return !1;
  }
  return r.test(e);
};
var ni = Vu;
const Xu = Le(), Yu = (e, r) => new Xu(e, r).set.map((t) => t.map((i) => i.value).join(" ").trim().split(" "));
var Ku = Yu;
const Ju = ye, Qu = Le(), ec = (e, r, t) => {
  let i = null, n = null, a = null;
  try {
    a = new Qu(r, t);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    a.test(s) && (!i || n.compare(s) === -1) && (i = s, n = new Ju(i, t));
  }), i;
};
var tc = ec;
const rc = ye, ic = Le(), nc = (e, r, t) => {
  let i = null, n = null, a = null;
  try {
    a = new ic(r, t);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    a.test(s) && (!i || n.compare(s) === 1) && (i = s, n = new rc(i, t));
  }), i;
};
var ac = nc;
const yi = ye, sc = Le(), ka = ri, oc = (e, r) => {
  e = new sc(e, r);
  let t = new yi("0.0.0");
  if (e.test(t) || (t = new yi("0.0.0-0"), e.test(t)))
    return t;
  t = null;
  for (let i = 0; i < e.set.length; ++i) {
    const n = e.set[i];
    let a = null;
    n.forEach((s) => {
      const f = new yi(s.semver.version);
      switch (s.operator) {
        case ">":
          f.prerelease.length === 0 ? f.patch++ : f.prerelease.push(0), f.raw = f.format();
        case "":
        case ">=":
          (!a || ka(f, a)) && (a = f);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${s.operator}`);
      }
    }), a && (!t || ka(t, a)) && (t = a);
  }
  return t && e.test(t) ? t : null;
};
var fc = oc;
const lc = Le(), uc = (e, r) => {
  try {
    return new lc(e, r).range || "*";
  } catch {
    return null;
  }
};
var cc = uc;
const hc = ye, Lo = ii(), { ANY: dc } = Lo, vc = Le(), pc = ni, xa = ri, Ra = Ln, _c = Pn, gc = Dn, mc = (e, r, t, i) => {
  e = new hc(e, i), r = new vc(r, i);
  let n, a, s, f, c;
  switch (t) {
    case ">":
      n = xa, a = _c, s = Ra, f = ">", c = ">=";
      break;
    case "<":
      n = Ra, a = gc, s = xa, f = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (pc(e, r, i))
    return !1;
  for (let o = 0; o < r.set.length; ++o) {
    const d = r.set[o];
    let m = null, u = null;
    if (d.forEach((h) => {
      h.semver === dc && (h = new Lo(">=0.0.0")), m = m || h, u = u || h, n(h.semver, m.semver, i) ? m = h : s(h.semver, u.semver, i) && (u = h);
    }), m.operator === f || m.operator === c || (!u.operator || u.operator === f) && a(e, u.semver))
      return !1;
    if (u.operator === c && s(e, u.semver))
      return !1;
  }
  return !0;
};
var jn = mc;
const yc = jn, wc = (e, r, t) => yc(e, r, ">", t);
var Ec = wc;
const bc = jn, Sc = (e, r, t) => bc(e, r, "<", t);
var kc = Sc;
const Oa = Le(), xc = (e, r, t) => (e = new Oa(e, t), r = new Oa(r, t), e.intersects(r, t));
var Rc = xc;
const Oc = ni, Tc = Ne;
var Ac = (e, r, t) => {
  const i = [];
  let n = null, a = null;
  const s = e.sort((d, m) => Tc(d, m, t));
  for (const d of s)
    Oc(d, r, t) ? (a = d, n || (n = d)) : (a && i.push([n, a]), a = null, n = null);
  n && i.push([n, null]);
  const f = [];
  for (const [d, m] of i)
    d === m ? f.push(d) : !m && d === s[0] ? f.push("*") : m ? d === s[0] ? f.push(`<=${m}`) : f.push(`${d} - ${m}`) : f.push(`>=${d}`);
  const c = f.join(" || "), o = typeof r.raw == "string" ? r.raw : String(r);
  return c.length < o.length ? c : r;
};
const Ta = Le(), Fn = ii(), { ANY: wi } = Fn, Wt = ni, Bn = Ne, $c = (e, r, t = {}) => {
  if (e === r)
    return !0;
  e = new Ta(e, t), r = new Ta(r, t);
  let i = !1;
  e: for (const n of e.set) {
    for (const a of r.set) {
      const s = Cc(n, a, t);
      if (i = i || s !== null, s)
        continue e;
    }
    if (i)
      return !1;
  }
  return !0;
}, Ic = [new Fn(">=0.0.0-0")], Aa = [new Fn(">=0.0.0")], Cc = (e, r, t) => {
  if (e === r)
    return !0;
  if (e.length === 1 && e[0].semver === wi) {
    if (r.length === 1 && r[0].semver === wi)
      return !0;
    t.includePrerelease ? e = Ic : e = Aa;
  }
  if (r.length === 1 && r[0].semver === wi) {
    if (t.includePrerelease)
      return !0;
    r = Aa;
  }
  const i = /* @__PURE__ */ new Set();
  let n, a;
  for (const h of e)
    h.operator === ">" || h.operator === ">=" ? n = $a(n, h, t) : h.operator === "<" || h.operator === "<=" ? a = Ia(a, h, t) : i.add(h.semver);
  if (i.size > 1)
    return null;
  let s;
  if (n && a) {
    if (s = Bn(n.semver, a.semver, t), s > 0)
      return null;
    if (s === 0 && (n.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const h of i) {
    if (n && !Wt(h, String(n), t) || a && !Wt(h, String(a), t))
      return null;
    for (const p of r)
      if (!Wt(h, String(p), t))
        return !1;
    return !0;
  }
  let f, c, o, d, m = a && !t.includePrerelease && a.semver.prerelease.length ? a.semver : !1, u = n && !t.includePrerelease && n.semver.prerelease.length ? n.semver : !1;
  m && m.prerelease.length === 1 && a.operator === "<" && m.prerelease[0] === 0 && (m = !1);
  for (const h of r) {
    if (d = d || h.operator === ">" || h.operator === ">=", o = o || h.operator === "<" || h.operator === "<=", n) {
      if (u && h.semver.prerelease && h.semver.prerelease.length && h.semver.major === u.major && h.semver.minor === u.minor && h.semver.patch === u.patch && (u = !1), h.operator === ">" || h.operator === ">=") {
        if (f = $a(n, h, t), f === h && f !== n)
          return !1;
      } else if (n.operator === ">=" && !Wt(n.semver, String(h), t))
        return !1;
    }
    if (a) {
      if (m && h.semver.prerelease && h.semver.prerelease.length && h.semver.major === m.major && h.semver.minor === m.minor && h.semver.patch === m.patch && (m = !1), h.operator === "<" || h.operator === "<=") {
        if (c = Ia(a, h, t), c === h && c !== a)
          return !1;
      } else if (a.operator === "<=" && !Wt(a.semver, String(h), t))
        return !1;
    }
    if (!h.operator && (a || n) && s !== 0)
      return !1;
  }
  return !(n && o && !a && s !== 0 || a && d && !n && s !== 0 || u || m);
}, $a = (e, r, t) => {
  if (!e)
    return r;
  const i = Bn(e.semver, r.semver, t);
  return i > 0 ? e : i < 0 || r.operator === ">" && e.operator === ">=" ? r : e;
}, Ia = (e, r, t) => {
  if (!e)
    return r;
  const i = Bn(e.semver, r.semver, t);
  return i < 0 ? e : i > 0 || r.operator === "<" && e.operator === "<=" ? r : e;
};
var Nc = $c;
const Ei = ur, Ca = ei, Lc = ye, Na = $o, Dc = Dt, Pc = zl, jc = Wl, Fc = Hl, Bc = Xl, Mc = Jl, Uc = tu, zc = nu, Gc = ou, Zc = Ne, Wc = cu, qc = vu, Hc = Nn, Vc = mu, Xc = Eu, Yc = ri, Kc = Ln, Jc = Io, Qc = Co, eh = Dn, th = Pn, rh = No, ih = Zu, nh = ii(), ah = Le(), sh = ni, oh = Ku, fh = tc, lh = ac, uh = fc, ch = cc, hh = jn, dh = Ec, vh = kc, ph = Rc, _h = Ac, gh = Nc;
var mh = {
  parse: Dc,
  valid: Pc,
  clean: jc,
  inc: Fc,
  diff: Bc,
  major: Mc,
  minor: Uc,
  patch: zc,
  prerelease: Gc,
  compare: Zc,
  rcompare: Wc,
  compareLoose: qc,
  compareBuild: Hc,
  sort: Vc,
  rsort: Xc,
  gt: Yc,
  lt: Kc,
  eq: Jc,
  neq: Qc,
  gte: eh,
  lte: th,
  cmp: rh,
  coerce: ih,
  Comparator: nh,
  Range: ah,
  satisfies: sh,
  toComparators: oh,
  maxSatisfying: fh,
  minSatisfying: lh,
  minVersion: uh,
  validRange: ch,
  outside: hh,
  gtr: dh,
  ltr: vh,
  intersects: ph,
  simplifyRange: _h,
  subset: gh,
  SemVer: Lc,
  re: Ei.re,
  src: Ei.src,
  tokens: Ei.t,
  SEMVER_SPEC_VERSION: Ca.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Ca.RELEASE_TYPES,
  compareIdentifiers: Na.compareIdentifiers,
  rcompareIdentifiers: Na.rcompareIdentifiers
}, Mn = {}, br = {}, La;
function yh() {
  if (La) return br;
  La = 1;
  var e = pe, r = process.platform === "win32", t = Je, i = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function n() {
    var c;
    if (i) {
      var o = new Error();
      c = d;
    } else
      c = m;
    return c;
    function d(u) {
      u && (o.message = u.message, u = o, m(u));
    }
    function m(u) {
      if (u) {
        if (process.throwDeprecation)
          throw u;
        if (!process.noDeprecation) {
          var h = "fs: missing callback " + (u.stack || u.message);
          process.traceDeprecation ? console.trace(h) : console.error(h);
        }
      }
    }
  }
  function a(c) {
    return typeof c == "function" ? c : n();
  }
  if (e.normalize, r)
    var s = /(.*?)(?:[\/\\]+|$)/g;
  else
    var s = /(.*?)(?:[\/]+|$)/g;
  if (r)
    var f = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  else
    var f = /^[\/]*/;
  return br.realpathSync = function(o, d) {
    if (o = e.resolve(o), d && Object.prototype.hasOwnProperty.call(d, o))
      return d[o];
    var m = o, u = {}, h = {}, p, v, x, l;
    _();
    function _() {
      var T = f.exec(o);
      p = T[0].length, v = T[0], x = T[0], l = "", r && !h[x] && (t.lstatSync(x), h[x] = !0);
    }
    for (; p < o.length; ) {
      s.lastIndex = p;
      var R = s.exec(o);
      if (l = v, v += R[0], x = l + R[1], p = s.lastIndex, !(h[x] || d && d[x] === x)) {
        var g;
        if (d && Object.prototype.hasOwnProperty.call(d, x))
          g = d[x];
        else {
          var E = t.lstatSync(x);
          if (!E.isSymbolicLink()) {
            h[x] = !0, d && (d[x] = x);
            continue;
          }
          var $ = null;
          if (!r) {
            var A = E.dev.toString(32) + ":" + E.ino.toString(32);
            u.hasOwnProperty(A) && ($ = u[A]);
          }
          $ === null && (t.statSync(x), $ = t.readlinkSync(x)), g = e.resolve(l, $), d && (d[x] = g), r || (u[A] = $);
        }
        o = e.resolve(g, o.slice(p)), _();
      }
    }
    return d && (d[m] = o), o;
  }, br.realpath = function(o, d, m) {
    if (typeof m != "function" && (m = a(d), d = null), o = e.resolve(o), d && Object.prototype.hasOwnProperty.call(d, o))
      return process.nextTick(m.bind(null, null, d[o]));
    var u = o, h = {}, p = {}, v, x, l, _;
    R();
    function R() {
      var T = f.exec(o);
      v = T[0].length, x = T[0], l = T[0], _ = "", r && !p[l] ? t.lstat(l, function(b) {
        if (b) return m(b);
        p[l] = !0, g();
      }) : process.nextTick(g);
    }
    function g() {
      if (v >= o.length)
        return d && (d[u] = o), m(null, o);
      s.lastIndex = v;
      var T = s.exec(o);
      return _ = x, x += T[0], l = _ + T[1], v = s.lastIndex, p[l] || d && d[l] === l ? process.nextTick(g) : d && Object.prototype.hasOwnProperty.call(d, l) ? A(d[l]) : t.lstat(l, E);
    }
    function E(T, b) {
      if (T) return m(T);
      if (!b.isSymbolicLink())
        return p[l] = !0, d && (d[l] = l), process.nextTick(g);
      if (!r) {
        var I = b.dev.toString(32) + ":" + b.ino.toString(32);
        if (h.hasOwnProperty(I))
          return $(null, h[I], l);
      }
      t.stat(l, function(O) {
        if (O) return m(O);
        t.readlink(l, function(L, B) {
          r || (h[I] = B), $(L, B);
        });
      });
    }
    function $(T, b, I) {
      if (T) return m(T);
      var O = e.resolve(_, b);
      d && (d[I] = O), A(O);
    }
    function A(T) {
      o = e.resolve(T, o.slice(v)), R();
    }
  }, br;
}
var bi, Da;
function Do() {
  if (Da) return bi;
  Da = 1, bi = f, f.realpath = f, f.sync = c, f.realpathSync = c, f.monkeypatch = o, f.unmonkeypatch = d;
  var e = Je, r = e.realpath, t = e.realpathSync, i = process.version, n = /^v[0-5]\./.test(i), a = yh();
  function s(m) {
    return m && m.syscall === "realpath" && (m.code === "ELOOP" || m.code === "ENOMEM" || m.code === "ENAMETOOLONG");
  }
  function f(m, u, h) {
    if (n)
      return r(m, u, h);
    typeof u == "function" && (h = u, u = null), r(m, u, function(p, v) {
      s(p) ? a.realpath(m, u, h) : h(p, v);
    });
  }
  function c(m, u) {
    if (n)
      return t(m, u);
    try {
      return t(m, u);
    } catch (h) {
      if (s(h))
        return a.realpathSync(m, u);
      throw h;
    }
  }
  function o() {
    e.realpath = f, e.realpathSync = c;
  }
  function d() {
    e.realpath = r, e.realpathSync = t;
  }
  return bi;
}
var Si, Pa;
function wh() {
  if (Pa) return Si;
  Pa = 1, Si = function(r, t) {
    for (var i = [], n = 0; n < r.length; n++) {
      var a = t(r[n], n);
      e(a) ? i.push.apply(i, a) : i.push(a);
    }
    return i;
  };
  var e = Array.isArray || function(r) {
    return Object.prototype.toString.call(r) === "[object Array]";
  };
  return Si;
}
var ki, ja;
function Eh() {
  if (ja) return ki;
  ja = 1, ki = e;
  function e(i, n, a) {
    i instanceof RegExp && (i = r(i, a)), n instanceof RegExp && (n = r(n, a));
    var s = t(i, n, a);
    return s && {
      start: s[0],
      end: s[1],
      pre: a.slice(0, s[0]),
      body: a.slice(s[0] + i.length, s[1]),
      post: a.slice(s[1] + n.length)
    };
  }
  function r(i, n) {
    var a = n.match(i);
    return a ? a[0] : null;
  }
  e.range = t;
  function t(i, n, a) {
    var s, f, c, o, d, m = a.indexOf(i), u = a.indexOf(n, m + 1), h = m;
    if (m >= 0 && u > 0) {
      if (i === n)
        return [m, u];
      for (s = [], c = a.length; h >= 0 && !d; )
        h == m ? (s.push(h), m = a.indexOf(i, h + 1)) : s.length == 1 ? d = [s.pop(), u] : (f = s.pop(), f < c && (c = f, o = u), u = a.indexOf(n, h + 1)), h = m < u && m >= 0 ? m : u;
      s.length && (d = [c, o]);
    }
    return d;
  }
  return ki;
}
var xi, Fa;
function bh() {
  if (Fa) return xi;
  Fa = 1;
  var e = wh(), r = Eh();
  xi = m;
  var t = "\0SLASH" + Math.random() + "\0", i = "\0OPEN" + Math.random() + "\0", n = "\0CLOSE" + Math.random() + "\0", a = "\0COMMA" + Math.random() + "\0", s = "\0PERIOD" + Math.random() + "\0";
  function f(l) {
    return parseInt(l, 10) == l ? parseInt(l, 10) : l.charCodeAt(0);
  }
  function c(l) {
    return l.split("\\\\").join(t).split("\\{").join(i).split("\\}").join(n).split("\\,").join(a).split("\\.").join(s);
  }
  function o(l) {
    return l.split(t).join("\\").split(i).join("{").split(n).join("}").split(a).join(",").split(s).join(".");
  }
  function d(l) {
    if (!l)
      return [""];
    var _ = [], R = r("{", "}", l);
    if (!R)
      return l.split(",");
    var g = R.pre, E = R.body, $ = R.post, A = g.split(",");
    A[A.length - 1] += "{" + E + "}";
    var T = d($);
    return $.length && (A[A.length - 1] += T.shift(), A.push.apply(A, T)), _.push.apply(_, A), _;
  }
  function m(l) {
    return l ? (l.substr(0, 2) === "{}" && (l = "\\{\\}" + l.substr(2)), x(c(l), !0).map(o)) : [];
  }
  function u(l) {
    return "{" + l + "}";
  }
  function h(l) {
    return /^-?0\d/.test(l);
  }
  function p(l, _) {
    return l <= _;
  }
  function v(l, _) {
    return l >= _;
  }
  function x(l, _) {
    var R = [], g = r("{", "}", l);
    if (!g || /\$$/.test(g.pre)) return [l];
    var E = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(g.body), $ = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(g.body), A = E || $, T = g.body.indexOf(",") >= 0;
    if (!A && !T)
      return g.post.match(/,.*\}/) ? (l = g.pre + "{" + g.body + n + g.post, x(l)) : [l];
    var b;
    if (A)
      b = g.body.split(/\.\./);
    else if (b = d(g.body), b.length === 1 && (b = x(b[0], !1).map(u), b.length === 1)) {
      var O = g.post.length ? x(g.post, !1) : [""];
      return O.map(function(k) {
        return g.pre + b[0] + k;
      });
    }
    var I = g.pre, O = g.post.length ? x(g.post, !1) : [""], L;
    if (A) {
      var B = f(b[0]), N = f(b[1]), P = Math.max(b[0].length, b[1].length), G = b.length == 3 ? Math.abs(f(b[2])) : 1, w = p, S = N < B;
      S && (G *= -1, w = v);
      var C = b.some(h);
      L = [];
      for (var j = B; w(j, N); j += G) {
        var U;
        if ($)
          U = String.fromCharCode(j), U === "\\" && (U = "");
        else if (U = String(j), C) {
          var Z = P - U.length;
          if (Z > 0) {
            var H = new Array(Z + 1).join("0");
            j < 0 ? U = "-" + H + U.slice(1) : U = H + U;
          }
        }
        L.push(U);
      }
    } else
      L = e(b, function(y) {
        return x(y, !1);
      });
    for (var X = 0; X < L.length; X++)
      for (var Q = 0; Q < O.length; Q++) {
        var Y = I + L[X] + O[Q];
        (!_ || A || Y) && R.push(Y);
      }
    return R;
  }
  return xi;
}
var Ri, Ba;
function Un() {
  if (Ba) return Ri;
  Ba = 1, Ri = h, h.Minimatch = p;
  var e = function() {
    try {
      return require("path");
    } catch {
    }
  }() || {
    sep: "/"
  };
  h.sep = e.sep;
  var r = h.GLOBSTAR = p.GLOBSTAR = {}, t = bh(), i = {
    "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
    "?": { open: "(?:", close: ")?" },
    "+": { open: "(?:", close: ")+" },
    "*": { open: "(?:", close: ")*" },
    "@": { open: "(?:", close: ")" }
  }, n = "[^/]", a = n + "*?", s = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?", f = "(?:(?!(?:\\/|^)\\.).)*?", c = o("().*{}+?[]^$\\!");
  function o(b) {
    return b.split("").reduce(function(I, O) {
      return I[O] = !0, I;
    }, {});
  }
  var d = /\/+/;
  h.filter = m;
  function m(b, I) {
    return I = I || {}, function(O, L, B) {
      return h(O, b, I);
    };
  }
  function u(b, I) {
    I = I || {};
    var O = {};
    return Object.keys(b).forEach(function(L) {
      O[L] = b[L];
    }), Object.keys(I).forEach(function(L) {
      O[L] = I[L];
    }), O;
  }
  h.defaults = function(b) {
    if (!b || typeof b != "object" || !Object.keys(b).length)
      return h;
    var I = h, O = function(B, N, P) {
      return I(B, N, u(b, P));
    };
    return O.Minimatch = function(B, N) {
      return new I.Minimatch(B, u(b, N));
    }, O.Minimatch.defaults = function(B) {
      return I.defaults(u(b, B)).Minimatch;
    }, O.filter = function(B, N) {
      return I.filter(B, u(b, N));
    }, O.defaults = function(B) {
      return I.defaults(u(b, B));
    }, O.makeRe = function(B, N) {
      return I.makeRe(B, u(b, N));
    }, O.braceExpand = function(B, N) {
      return I.braceExpand(B, u(b, N));
    }, O.match = function(L, B, N) {
      return I.match(L, B, u(b, N));
    }, O;
  }, p.defaults = function(b) {
    return h.defaults(b).Minimatch;
  };
  function h(b, I, O) {
    return R(I), O || (O = {}), !O.nocomment && I.charAt(0) === "#" ? !1 : new p(I, O).match(b);
  }
  function p(b, I) {
    if (!(this instanceof p))
      return new p(b, I);
    R(b), I || (I = {}), b = b.trim(), !I.allowWindowsEscape && e.sep !== "/" && (b = b.split(e.sep).join("/")), this.options = I, this.set = [], this.pattern = b, this.regexp = null, this.negate = !1, this.comment = !1, this.empty = !1, this.partial = !!I.partial, this.make();
  }
  p.prototype.debug = function() {
  }, p.prototype.make = v;
  function v() {
    var b = this.pattern, I = this.options;
    if (!I.nocomment && b.charAt(0) === "#") {
      this.comment = !0;
      return;
    }
    if (!b) {
      this.empty = !0;
      return;
    }
    this.parseNegate();
    var O = this.globSet = this.braceExpand();
    I.debug && (this.debug = function() {
      console.error.apply(console, arguments);
    }), this.debug(this.pattern, O), O = this.globParts = O.map(function(L) {
      return L.split(d);
    }), this.debug(this.pattern, O), O = O.map(function(L, B, N) {
      return L.map(this.parse, this);
    }, this), this.debug(this.pattern, O), O = O.filter(function(L) {
      return L.indexOf(!1) === -1;
    }), this.debug(this.pattern, O), this.set = O;
  }
  p.prototype.parseNegate = x;
  function x() {
    var b = this.pattern, I = !1, O = this.options, L = 0;
    if (!O.nonegate) {
      for (var B = 0, N = b.length; B < N && b.charAt(B) === "!"; B++)
        I = !I, L++;
      L && (this.pattern = b.substr(L)), this.negate = I;
    }
  }
  h.braceExpand = function(b, I) {
    return l(b, I);
  }, p.prototype.braceExpand = l;
  function l(b, I) {
    return I || (this instanceof p ? I = this.options : I = {}), b = typeof b > "u" ? this.pattern : b, R(b), I.nobrace || !/\{(?:(?!\{).)*\}/.test(b) ? [b] : t(b);
  }
  var _ = 1024 * 64, R = function(b) {
    if (typeof b != "string")
      throw new TypeError("invalid pattern");
    if (b.length > _)
      throw new TypeError("pattern is too long");
  };
  p.prototype.parse = E;
  var g = {};
  function E(b, I) {
    R(b);
    var O = this.options;
    if (b === "**")
      if (O.noglobstar)
        b = "*";
      else
        return r;
    if (b === "") return "";
    var L = "", B = !!O.nocase, N = !1, P = [], G = [], w, S = !1, C = -1, j = -1, U = b.charAt(0) === "." ? "" : O.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)", Z = this;
    function H() {
      if (w) {
        switch (w) {
          case "*":
            L += a, B = !0;
            break;
          case "?":
            L += n, B = !0;
            break;
          default:
            L += "\\" + w;
            break;
        }
        Z.debug("clearStateChar %j %j", w, L), w = !1;
      }
    }
    for (var X = 0, Q = b.length, Y; X < Q && (Y = b.charAt(X)); X++) {
      if (this.debug("%s	%s %s %j", b, X, L, Y), N && c[Y]) {
        L += "\\" + Y, N = !1;
        continue;
      }
      switch (Y) {
        case "/":
          return !1;
        case "\\":
          H(), N = !0;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          if (this.debug("%s	%s %s %j <-- stateChar", b, X, L, Y), S) {
            this.debug("  in class"), Y === "!" && X === j + 1 && (Y = "^"), L += Y;
            continue;
          }
          Z.debug("call clearStateChar %j", w), H(), w = Y, O.noext && H();
          continue;
        case "(":
          if (S) {
            L += "(";
            continue;
          }
          if (!w) {
            L += "\\(";
            continue;
          }
          P.push({
            type: w,
            start: X - 1,
            reStart: L.length,
            open: i[w].open,
            close: i[w].close
          }), L += w === "!" ? "(?:(?!(?:" : "(?:", this.debug("plType %j %j", w, L), w = !1;
          continue;
        case ")":
          if (S || !P.length) {
            L += "\\)";
            continue;
          }
          H(), B = !0;
          var y = P.pop();
          L += y.close, y.type === "!" && G.push(y), y.reEnd = L.length;
          continue;
        case "|":
          if (S || !P.length || N) {
            L += "\\|", N = !1;
            continue;
          }
          H(), L += "|";
          continue;
        case "[":
          if (H(), S) {
            L += "\\" + Y;
            continue;
          }
          S = !0, j = X, C = L.length, L += Y;
          continue;
        case "]":
          if (X === j + 1 || !S) {
            L += "\\" + Y, N = !1;
            continue;
          }
          var k = b.substring(j + 1, X);
          try {
            RegExp("[" + k + "]");
          } catch {
            var M = this.parse(k, g);
            L = L.substr(0, C) + "\\[" + M[0] + "\\]", B = B || M[1], S = !1;
            continue;
          }
          B = !0, S = !1, L += Y;
          continue;
        default:
          H(), N ? N = !1 : c[Y] && !(Y === "^" && S) && (L += "\\"), L += Y;
      }
    }
    for (S && (k = b.substr(j + 1), M = this.parse(k, g), L = L.substr(0, C) + "\\[" + M[0], B = B || M[1]), y = P.pop(); y; y = P.pop()) {
      var W = L.slice(y.reStart + y.open.length);
      this.debug("setting tail", L, y), W = W.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(q, ne, ie) {
        return ie || (ie = "\\"), ne + ne + ie + "|";
      }), this.debug(`tail=%j
   %s`, W, W, y, L);
      var ee = y.type === "*" ? a : y.type === "?" ? n : "\\" + y.type;
      B = !0, L = L.slice(0, y.reStart) + ee + "\\(" + W;
    }
    H(), N && (L += "\\\\");
    var V = !1;
    switch (L.charAt(0)) {
      case "[":
      case ".":
      case "(":
        V = !0;
    }
    for (var K = G.length - 1; K > -1; K--) {
      var Ee = G[K], Ze = L.slice(0, Ee.reStart), lt = L.slice(Ee.reStart, Ee.reEnd - 8), bt = L.slice(Ee.reEnd - 8, Ee.reEnd), se = L.slice(Ee.reEnd);
      bt += se;
      var We = Ze.split("(").length - 1, qe = se;
      for (X = 0; X < We; X++)
        qe = qe.replace(/\)[+*?]?/, "");
      se = qe;
      var He = "";
      se === "" && I !== g && (He = "$");
      var D = Ze + lt + se + He + bt;
      L = D;
    }
    if (L !== "" && B && (L = "(?=.)" + L), V && (L = U + L), I === g)
      return [L, B];
    if (!B)
      return A(b);
    var F = O.nocase ? "i" : "";
    try {
      var z = new RegExp("^" + L + "$", F);
    } catch {
      return new RegExp("$.");
    }
    return z._glob = b, z._src = L, z;
  }
  h.makeRe = function(b, I) {
    return new p(b, I || {}).makeRe();
  }, p.prototype.makeRe = $;
  function $() {
    if (this.regexp || this.regexp === !1) return this.regexp;
    var b = this.set;
    if (!b.length)
      return this.regexp = !1, this.regexp;
    var I = this.options, O = I.noglobstar ? a : I.dot ? s : f, L = I.nocase ? "i" : "", B = b.map(function(N) {
      return N.map(function(P) {
        return P === r ? O : typeof P == "string" ? T(P) : P._src;
      }).join("\\/");
    }).join("|");
    B = "^(?:" + B + ")$", this.negate && (B = "^(?!" + B + ").*$");
    try {
      this.regexp = new RegExp(B, L);
    } catch {
      this.regexp = !1;
    }
    return this.regexp;
  }
  h.match = function(b, I, O) {
    O = O || {};
    var L = new p(I, O);
    return b = b.filter(function(B) {
      return L.match(B);
    }), L.options.nonull && !b.length && b.push(I), b;
  }, p.prototype.match = function(I, O) {
    if (typeof O > "u" && (O = this.partial), this.debug("match", I, this.pattern), this.comment) return !1;
    if (this.empty) return I === "";
    if (I === "/" && O) return !0;
    var L = this.options;
    e.sep !== "/" && (I = I.split(e.sep).join("/")), I = I.split(d), this.debug(this.pattern, "split", I);
    var B = this.set;
    this.debug(this.pattern, "set", B);
    var N, P;
    for (P = I.length - 1; P >= 0 && (N = I[P], !N); P--)
      ;
    for (P = 0; P < B.length; P++) {
      var G = B[P], w = I;
      L.matchBase && G.length === 1 && (w = [N]);
      var S = this.matchOne(w, G, O);
      if (S)
        return L.flipNegate ? !0 : !this.negate;
    }
    return L.flipNegate ? !1 : this.negate;
  }, p.prototype.matchOne = function(b, I, O) {
    var L = this.options;
    this.debug(
      "matchOne",
      { this: this, file: b, pattern: I }
    ), this.debug("matchOne", b.length, I.length);
    for (var B = 0, N = 0, P = b.length, G = I.length; B < P && N < G; B++, N++) {
      this.debug("matchOne loop");
      var w = I[N], S = b[B];
      if (this.debug(I, w, S), w === !1) return !1;
      if (w === r) {
        this.debug("GLOBSTAR", [I, w, S]);
        var C = B, j = N + 1;
        if (j === G) {
          for (this.debug("** at the end"); B < P; B++)
            if (b[B] === "." || b[B] === ".." || !L.dot && b[B].charAt(0) === ".") return !1;
          return !0;
        }
        for (; C < P; ) {
          var U = b[C];
          if (this.debug(`
globstar while`, b, C, I, j, U), this.matchOne(b.slice(C), I.slice(j), O))
            return this.debug("globstar found match!", C, P, U), !0;
          if (U === "." || U === ".." || !L.dot && U.charAt(0) === ".") {
            this.debug("dot detected!", b, C, I, j);
            break;
          }
          this.debug("globstar swallow a segment, and continue"), C++;
        }
        return !!(O && (this.debug(`
>>> no match, partial?`, b, C, I, j), C === P));
      }
      var Z;
      if (typeof w == "string" ? (Z = S === w, this.debug("string match", w, S, Z)) : (Z = S.match(w), this.debug("pattern match", w, S, Z)), !Z) return !1;
    }
    if (B === P && N === G)
      return !0;
    if (B === P)
      return O;
    if (N === G)
      return B === P - 1 && b[B] === "";
    throw new Error("wtf?");
  };
  function A(b) {
    return b.replace(/\\(.)/g, "$1");
  }
  function T(b) {
    return b.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  return Ri;
}
var Sr = { exports: {} }, kr = { exports: {} }, Ma;
function Sh() {
  return Ma || (Ma = 1, typeof Object.create == "function" ? kr.exports = function(r, t) {
    t && (r.super_ = t, r.prototype = Object.create(t.prototype, {
      constructor: {
        value: r,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : kr.exports = function(r, t) {
    if (t) {
      r.super_ = t;
      var i = function() {
      };
      i.prototype = t.prototype, r.prototype = new i(), r.prototype.constructor = r;
    }
  }), kr.exports;
}
var Ua;
function Pt() {
  if (Ua) return Sr.exports;
  Ua = 1;
  try {
    var e = require("util");
    if (typeof e.inherits != "function") throw "";
    Sr.exports = e.inherits;
  } catch {
    Sr.exports = Sh();
  }
  return Sr.exports;
}
var qt = { exports: {} }, za;
function zn() {
  if (za) return qt.exports;
  za = 1;
  function e(t) {
    return t.charAt(0) === "/";
  }
  function r(t) {
    var i = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/, n = i.exec(t), a = n[1] || "", s = !!(a && a.charAt(1) !== ":");
    return !!(n[2] || s);
  }
  return qt.exports = process.platform === "win32" ? r : e, qt.exports.posix = e, qt.exports.win32 = r, qt.exports;
}
var Ve = {}, Ga;
function Po() {
  if (Ga) return Ve;
  Ga = 1, Ve.setopts = o, Ve.ownProp = e, Ve.makeAbs = u, Ve.finish = d, Ve.mark = m, Ve.isIgnored = h, Ve.childrenIgnored = p;
  function e(v, x) {
    return Object.prototype.hasOwnProperty.call(v, x);
  }
  var r = Je, t = pe, i = Un(), n = zn(), a = i.Minimatch;
  function s(v, x) {
    return v.localeCompare(x, "en");
  }
  function f(v, x) {
    v.ignore = x.ignore || [], Array.isArray(v.ignore) || (v.ignore = [v.ignore]), v.ignore.length && (v.ignore = v.ignore.map(c));
  }
  function c(v) {
    var x = null;
    if (v.slice(-3) === "/**") {
      var l = v.replace(/(\/\*\*)+$/, "");
      x = new a(l, { dot: !0 });
    }
    return {
      matcher: new a(v, { dot: !0 }),
      gmatcher: x
    };
  }
  function o(v, x, l) {
    if (l || (l = {}), l.matchBase && x.indexOf("/") === -1) {
      if (l.noglobstar)
        throw new Error("base matching requires globstar");
      x = "**/" + x;
    }
    v.silent = !!l.silent, v.pattern = x, v.strict = l.strict !== !1, v.realpath = !!l.realpath, v.realpathCache = l.realpathCache || /* @__PURE__ */ Object.create(null), v.follow = !!l.follow, v.dot = !!l.dot, v.mark = !!l.mark, v.nodir = !!l.nodir, v.nodir && (v.mark = !0), v.sync = !!l.sync, v.nounique = !!l.nounique, v.nonull = !!l.nonull, v.nosort = !!l.nosort, v.nocase = !!l.nocase, v.stat = !!l.stat, v.noprocess = !!l.noprocess, v.absolute = !!l.absolute, v.fs = l.fs || r, v.maxLength = l.maxLength || 1 / 0, v.cache = l.cache || /* @__PURE__ */ Object.create(null), v.statCache = l.statCache || /* @__PURE__ */ Object.create(null), v.symlinks = l.symlinks || /* @__PURE__ */ Object.create(null), f(v, l), v.changedCwd = !1;
    var _ = process.cwd();
    e(l, "cwd") ? (v.cwd = t.resolve(l.cwd), v.changedCwd = v.cwd !== _) : v.cwd = _, v.root = l.root || t.resolve(v.cwd, "/"), v.root = t.resolve(v.root), process.platform === "win32" && (v.root = v.root.replace(/\\/g, "/")), v.cwdAbs = n(v.cwd) ? v.cwd : u(v, v.cwd), process.platform === "win32" && (v.cwdAbs = v.cwdAbs.replace(/\\/g, "/")), v.nomount = !!l.nomount, l.nonegate = !0, l.nocomment = !0, l.allowWindowsEscape = !1, v.minimatch = new a(x, l), v.options = v.minimatch.options;
  }
  function d(v) {
    for (var x = v.nounique, l = x ? [] : /* @__PURE__ */ Object.create(null), _ = 0, R = v.matches.length; _ < R; _++) {
      var g = v.matches[_];
      if (!g || Object.keys(g).length === 0) {
        if (v.nonull) {
          var E = v.minimatch.globSet[_];
          x ? l.push(E) : l[E] = !0;
        }
      } else {
        var $ = Object.keys(g);
        x ? l.push.apply(l, $) : $.forEach(function(A) {
          l[A] = !0;
        });
      }
    }
    if (x || (l = Object.keys(l)), v.nosort || (l = l.sort(s)), v.mark) {
      for (var _ = 0; _ < l.length; _++)
        l[_] = v._mark(l[_]);
      v.nodir && (l = l.filter(function(A) {
        var T = !/\/$/.test(A), b = v.cache[A] || v.cache[u(v, A)];
        return T && b && (T = b !== "DIR" && !Array.isArray(b)), T;
      }));
    }
    v.ignore.length && (l = l.filter(function(A) {
      return !h(v, A);
    })), v.found = l;
  }
  function m(v, x) {
    var l = u(v, x), _ = v.cache[l], R = x;
    if (_) {
      var g = _ === "DIR" || Array.isArray(_), E = x.slice(-1) === "/";
      if (g && !E ? R += "/" : !g && E && (R = R.slice(0, -1)), R !== x) {
        var $ = u(v, R);
        v.statCache[$] = v.statCache[l], v.cache[$] = v.cache[l];
      }
    }
    return R;
  }
  function u(v, x) {
    var l = x;
    return x.charAt(0) === "/" ? l = t.join(v.root, x) : n(x) || x === "" ? l = x : v.changedCwd ? l = t.resolve(v.cwd, x) : l = t.resolve(x), process.platform === "win32" && (l = l.replace(/\\/g, "/")), l;
  }
  function h(v, x) {
    return v.ignore.length ? v.ignore.some(function(l) {
      return l.matcher.match(x) || !!(l.gmatcher && l.gmatcher.match(x));
    }) : !1;
  }
  function p(v, x) {
    return v.ignore.length ? v.ignore.some(function(l) {
      return !!(l.gmatcher && l.gmatcher.match(x));
    }) : !1;
  }
  return Ve;
}
var Oi, Za;
function kh() {
  if (Za) return Oi;
  Za = 1, Oi = d, d.GlobSync = m;
  var e = Do(), r = Un();
  r.Minimatch, Bo().Glob;
  var t = pe, i = $n, n = zn(), a = Po(), s = a.setopts, f = a.ownProp, c = a.childrenIgnored, o = a.isIgnored;
  function d(u, h) {
    if (typeof h == "function" || arguments.length === 3)
      throw new TypeError(`callback provided to sync glob
See: https://github.com/isaacs/node-glob/issues/167`);
    return new m(u, h).found;
  }
  function m(u, h) {
    if (!u)
      throw new Error("must provide pattern");
    if (typeof h == "function" || arguments.length === 3)
      throw new TypeError(`callback provided to sync glob
See: https://github.com/isaacs/node-glob/issues/167`);
    if (!(this instanceof m))
      return new m(u, h);
    if (s(this, u, h), this.noprocess)
      return this;
    var p = this.minimatch.set.length;
    this.matches = new Array(p);
    for (var v = 0; v < p; v++)
      this._process(this.minimatch.set[v], v, !1);
    this._finish();
  }
  return m.prototype._finish = function() {
    if (i.ok(this instanceof m), this.realpath) {
      var u = this;
      this.matches.forEach(function(h, p) {
        var v = u.matches[p] = /* @__PURE__ */ Object.create(null);
        for (var x in h)
          try {
            x = u._makeAbs(x);
            var l = e.realpathSync(x, u.realpathCache);
            v[l] = !0;
          } catch (_) {
            if (_.syscall === "stat")
              v[u._makeAbs(x)] = !0;
            else
              throw _;
          }
      });
    }
    a.finish(this);
  }, m.prototype._process = function(u, h, p) {
    i.ok(this instanceof m);
    for (var v = 0; typeof u[v] == "string"; )
      v++;
    var x;
    switch (v) {
      case u.length:
        this._processSimple(u.join("/"), h);
        return;
      case 0:
        x = null;
        break;
      default:
        x = u.slice(0, v).join("/");
        break;
    }
    var l = u.slice(v), _;
    x === null ? _ = "." : ((n(x) || n(u.map(function(E) {
      return typeof E == "string" ? E : "[*]";
    }).join("/"))) && (!x || !n(x)) && (x = "/" + x), _ = x);
    var R = this._makeAbs(_);
    if (!c(this, _)) {
      var g = l[0] === r.GLOBSTAR;
      g ? this._processGlobStar(x, _, R, l, h, p) : this._processReaddir(x, _, R, l, h, p);
    }
  }, m.prototype._processReaddir = function(u, h, p, v, x, l) {
    var _ = this._readdir(p, l);
    if (_) {
      for (var R = v[0], g = !!this.minimatch.negate, E = R._glob, $ = this.dot || E.charAt(0) === ".", A = [], T = 0; T < _.length; T++) {
        var b = _[T];
        if (b.charAt(0) !== "." || $) {
          var I;
          g && !u ? I = !b.match(R) : I = b.match(R), I && A.push(b);
        }
      }
      var O = A.length;
      if (O !== 0) {
        if (v.length === 1 && !this.mark && !this.stat) {
          this.matches[x] || (this.matches[x] = /* @__PURE__ */ Object.create(null));
          for (var T = 0; T < O; T++) {
            var b = A[T];
            u && (u.slice(-1) !== "/" ? b = u + "/" + b : b = u + b), b.charAt(0) === "/" && !this.nomount && (b = t.join(this.root, b)), this._emitMatch(x, b);
          }
          return;
        }
        v.shift();
        for (var T = 0; T < O; T++) {
          var b = A[T], L;
          u ? L = [u, b] : L = [b], this._process(L.concat(v), x, l);
        }
      }
    }
  }, m.prototype._emitMatch = function(u, h) {
    if (!o(this, h)) {
      var p = this._makeAbs(h);
      if (this.mark && (h = this._mark(h)), this.absolute && (h = p), !this.matches[u][h]) {
        if (this.nodir) {
          var v = this.cache[p];
          if (v === "DIR" || Array.isArray(v))
            return;
        }
        this.matches[u][h] = !0, this.stat && this._stat(h);
      }
    }
  }, m.prototype._readdirInGlobStar = function(u) {
    if (this.follow)
      return this._readdir(u, !1);
    var h, p;
    try {
      p = this.fs.lstatSync(u);
    } catch (x) {
      if (x.code === "ENOENT")
        return null;
    }
    var v = p && p.isSymbolicLink();
    return this.symlinks[u] = v, !v && p && !p.isDirectory() ? this.cache[u] = "FILE" : h = this._readdir(u, !1), h;
  }, m.prototype._readdir = function(u, h) {
    if (h && !f(this.symlinks, u))
      return this._readdirInGlobStar(u);
    if (f(this.cache, u)) {
      var p = this.cache[u];
      if (!p || p === "FILE")
        return null;
      if (Array.isArray(p))
        return p;
    }
    try {
      return this._readdirEntries(u, this.fs.readdirSync(u));
    } catch (v) {
      return this._readdirError(u, v), null;
    }
  }, m.prototype._readdirEntries = function(u, h) {
    if (!this.mark && !this.stat)
      for (var p = 0; p < h.length; p++) {
        var v = h[p];
        u === "/" ? v = u + v : v = u + "/" + v, this.cache[v] = !0;
      }
    return this.cache[u] = h, h;
  }, m.prototype._readdirError = function(u, h) {
    switch (h.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var p = this._makeAbs(u);
        if (this.cache[p] = "FILE", p === this.cwdAbs) {
          var v = new Error(h.code + " invalid cwd " + this.cwd);
          throw v.path = this.cwd, v.code = h.code, v;
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(u)] = !1;
        break;
      default:
        if (this.cache[this._makeAbs(u)] = !1, this.strict)
          throw h;
        this.silent || console.error("glob error", h);
        break;
    }
  }, m.prototype._processGlobStar = function(u, h, p, v, x, l) {
    var _ = this._readdir(p, l);
    if (_) {
      var R = v.slice(1), g = u ? [u] : [], E = g.concat(R);
      this._process(E, x, !1);
      var $ = _.length, A = this.symlinks[p];
      if (!(A && l))
        for (var T = 0; T < $; T++) {
          var b = _[T];
          if (!(b.charAt(0) === "." && !this.dot)) {
            var I = g.concat(_[T], R);
            this._process(I, x, !0);
            var O = g.concat(_[T], v);
            this._process(O, x, !0);
          }
        }
    }
  }, m.prototype._processSimple = function(u, h) {
    var p = this._stat(u);
    if (this.matches[h] || (this.matches[h] = /* @__PURE__ */ Object.create(null)), !!p) {
      if (u && n(u) && !this.nomount) {
        var v = /[\/\\]$/.test(u);
        u.charAt(0) === "/" ? u = t.join(this.root, u) : (u = t.resolve(this.root, u), v && (u += "/"));
      }
      process.platform === "win32" && (u = u.replace(/\\/g, "/")), this._emitMatch(h, u);
    }
  }, m.prototype._stat = function(u) {
    var h = this._makeAbs(u), p = u.slice(-1) === "/";
    if (u.length > this.maxLength)
      return !1;
    if (!this.stat && f(this.cache, h)) {
      var l = this.cache[h];
      if (Array.isArray(l) && (l = "DIR"), !p || l === "DIR")
        return l;
      if (p && l === "FILE")
        return !1;
    }
    var v = this.statCache[h];
    if (!v) {
      var x;
      try {
        x = this.fs.lstatSync(h);
      } catch (_) {
        if (_ && (_.code === "ENOENT" || _.code === "ENOTDIR"))
          return this.statCache[h] = !1, !1;
      }
      if (x && x.isSymbolicLink())
        try {
          v = this.fs.statSync(h);
        } catch {
          v = x;
        }
      else
        v = x;
    }
    this.statCache[h] = v;
    var l = !0;
    return v && (l = v.isDirectory() ? "DIR" : "FILE"), this.cache[h] = this.cache[h] || l, p && l === "FILE" ? !1 : l;
  }, m.prototype._mark = function(u) {
    return a.mark(this, u);
  }, m.prototype._makeAbs = function(u) {
    return a.makeAbs(this, u);
  }, Oi;
}
var Ti, Wa;
function jo() {
  if (Wa) return Ti;
  Wa = 1, Ti = e;
  function e(r, t) {
    if (r && t) return e(r)(t);
    if (typeof r != "function")
      throw new TypeError("need wrapper function");
    return Object.keys(r).forEach(function(n) {
      i[n] = r[n];
    }), i;
    function i() {
      for (var n = new Array(arguments.length), a = 0; a < n.length; a++)
        n[a] = arguments[a];
      var s = r.apply(this, n), f = n[n.length - 1];
      return typeof s == "function" && s !== f && Object.keys(f).forEach(function(c) {
        s[c] = f[c];
      }), s;
    }
  }
  return Ti;
}
var xr = { exports: {} }, qa;
function Fo() {
  if (qa) return xr.exports;
  qa = 1;
  var e = jo();
  xr.exports = e(r), xr.exports.strict = e(t), r.proto = r(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return r(this);
      },
      configurable: !0
    }), Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return t(this);
      },
      configurable: !0
    });
  });
  function r(i) {
    var n = function() {
      return n.called ? n.value : (n.called = !0, n.value = i.apply(this, arguments));
    };
    return n.called = !1, n;
  }
  function t(i) {
    var n = function() {
      if (n.called)
        throw new Error(n.onceError);
      return n.called = !0, n.value = i.apply(this, arguments);
    }, a = i.name || "Function wrapped with `once`";
    return n.onceError = a + " shouldn't be called more than once", n.called = !1, n;
  }
  return xr.exports;
}
var Ai, Ha;
function xh() {
  if (Ha) return Ai;
  Ha = 1;
  var e = jo(), r = /* @__PURE__ */ Object.create(null), t = Fo();
  Ai = e(i);
  function i(s, f) {
    return r[s] ? (r[s].push(f), null) : (r[s] = [f], n(s));
  }
  function n(s) {
    return t(function f() {
      var c = r[s], o = c.length, d = a(arguments);
      try {
        for (var m = 0; m < o; m++)
          c[m].apply(null, d);
      } finally {
        c.length > o ? (c.splice(0, o), process.nextTick(function() {
          f.apply(null, d);
        })) : delete r[s];
      }
    });
  }
  function a(s) {
    for (var f = s.length, c = [], o = 0; o < f; o++) c[o] = s[o];
    return c;
  }
  return Ai;
}
var $i, Va;
function Bo() {
  if (Va) return $i;
  Va = 1, $i = v;
  var e = Do(), r = Un();
  r.Minimatch;
  var t = Pt(), i = xo.EventEmitter, n = pe, a = $n, s = zn(), f = kh(), c = Po(), o = c.setopts, d = c.ownProp, m = xh(), u = c.childrenIgnored, h = c.isIgnored, p = Fo();
  function v(g, E, $) {
    if (typeof E == "function" && ($ = E, E = {}), E || (E = {}), E.sync) {
      if ($)
        throw new TypeError("callback provided to sync glob");
      return f(g, E);
    }
    return new _(g, E, $);
  }
  v.sync = f;
  var x = v.GlobSync = f.GlobSync;
  v.glob = v;
  function l(g, E) {
    if (E === null || typeof E != "object")
      return g;
    for (var $ = Object.keys(E), A = $.length; A--; )
      g[$[A]] = E[$[A]];
    return g;
  }
  v.hasMagic = function(g, E) {
    var $ = l({}, E);
    $.noprocess = !0;
    var A = new _(g, $), T = A.minimatch.set;
    if (!g)
      return !1;
    if (T.length > 1)
      return !0;
    for (var b = 0; b < T[0].length; b++)
      if (typeof T[0][b] != "string")
        return !0;
    return !1;
  }, v.Glob = _, t(_, i);
  function _(g, E, $) {
    if (typeof E == "function" && ($ = E, E = null), E && E.sync) {
      if ($)
        throw new TypeError("callback provided to sync glob");
      return new x(g, E);
    }
    if (!(this instanceof _))
      return new _(g, E, $);
    o(this, g, E), this._didRealPath = !1;
    var A = this.minimatch.set.length;
    this.matches = new Array(A), typeof $ == "function" && ($ = p($), this.on("error", $), this.on("end", function(L) {
      $(null, L);
    }));
    var T = this;
    if (this._processing = 0, this._emitQueue = [], this._processQueue = [], this.paused = !1, this.noprocess)
      return this;
    if (A === 0)
      return O();
    for (var b = !0, I = 0; I < A; I++)
      this._process(this.minimatch.set[I], I, !1, O);
    b = !1;
    function O() {
      --T._processing, T._processing <= 0 && (b ? process.nextTick(function() {
        T._finish();
      }) : T._finish());
    }
  }
  _.prototype._finish = function() {
    if (a(this instanceof _), !this.aborted) {
      if (this.realpath && !this._didRealpath)
        return this._realpath();
      c.finish(this), this.emit("end", this.found);
    }
  }, _.prototype._realpath = function() {
    if (this._didRealpath)
      return;
    this._didRealpath = !0;
    var g = this.matches.length;
    if (g === 0)
      return this._finish();
    for (var E = this, $ = 0; $ < this.matches.length; $++)
      this._realpathSet($, A);
    function A() {
      --g === 0 && E._finish();
    }
  }, _.prototype._realpathSet = function(g, E) {
    var $ = this.matches[g];
    if (!$)
      return E();
    var A = Object.keys($), T = this, b = A.length;
    if (b === 0)
      return E();
    var I = this.matches[g] = /* @__PURE__ */ Object.create(null);
    A.forEach(function(O, L) {
      O = T._makeAbs(O), e.realpath(O, T.realpathCache, function(B, N) {
        B ? B.syscall === "stat" ? I[O] = !0 : T.emit("error", B) : I[N] = !0, --b === 0 && (T.matches[g] = I, E());
      });
    });
  }, _.prototype._mark = function(g) {
    return c.mark(this, g);
  }, _.prototype._makeAbs = function(g) {
    return c.makeAbs(this, g);
  }, _.prototype.abort = function() {
    this.aborted = !0, this.emit("abort");
  }, _.prototype.pause = function() {
    this.paused || (this.paused = !0, this.emit("pause"));
  }, _.prototype.resume = function() {
    if (this.paused) {
      if (this.emit("resume"), this.paused = !1, this._emitQueue.length) {
        var g = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var E = 0; E < g.length; E++) {
          var $ = g[E];
          this._emitMatch($[0], $[1]);
        }
      }
      if (this._processQueue.length) {
        var A = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var E = 0; E < A.length; E++) {
          var T = A[E];
          this._processing--, this._process(T[0], T[1], T[2], T[3]);
        }
      }
    }
  }, _.prototype._process = function(g, E, $, A) {
    if (a(this instanceof _), a(typeof A == "function"), !this.aborted) {
      if (this._processing++, this.paused) {
        this._processQueue.push([g, E, $, A]);
        return;
      }
      for (var T = 0; typeof g[T] == "string"; )
        T++;
      var b;
      switch (T) {
        case g.length:
          this._processSimple(g.join("/"), E, A);
          return;
        case 0:
          b = null;
          break;
        default:
          b = g.slice(0, T).join("/");
          break;
      }
      var I = g.slice(T), O;
      b === null ? O = "." : ((s(b) || s(g.map(function(N) {
        return typeof N == "string" ? N : "[*]";
      }).join("/"))) && (!b || !s(b)) && (b = "/" + b), O = b);
      var L = this._makeAbs(O);
      if (u(this, O))
        return A();
      var B = I[0] === r.GLOBSTAR;
      B ? this._processGlobStar(b, O, L, I, E, $, A) : this._processReaddir(b, O, L, I, E, $, A);
    }
  }, _.prototype._processReaddir = function(g, E, $, A, T, b, I) {
    var O = this;
    this._readdir($, b, function(L, B) {
      return O._processReaddir2(g, E, $, A, T, b, B, I);
    });
  }, _.prototype._processReaddir2 = function(g, E, $, A, T, b, I, O) {
    if (!I)
      return O();
    for (var L = A[0], B = !!this.minimatch.negate, N = L._glob, P = this.dot || N.charAt(0) === ".", G = [], w = 0; w < I.length; w++) {
      var S = I[w];
      if (S.charAt(0) !== "." || P) {
        var C;
        B && !g ? C = !S.match(L) : C = S.match(L), C && G.push(S);
      }
    }
    var j = G.length;
    if (j === 0)
      return O();
    if (A.length === 1 && !this.mark && !this.stat) {
      this.matches[T] || (this.matches[T] = /* @__PURE__ */ Object.create(null));
      for (var w = 0; w < j; w++) {
        var S = G[w];
        g && (g !== "/" ? S = g + "/" + S : S = g + S), S.charAt(0) === "/" && !this.nomount && (S = n.join(this.root, S)), this._emitMatch(T, S);
      }
      return O();
    }
    A.shift();
    for (var w = 0; w < j; w++) {
      var S = G[w];
      g && (g !== "/" ? S = g + "/" + S : S = g + S), this._process([S].concat(A), T, b, O);
    }
    O();
  }, _.prototype._emitMatch = function(g, E) {
    if (!this.aborted && !h(this, E)) {
      if (this.paused) {
        this._emitQueue.push([g, E]);
        return;
      }
      var $ = s(E) ? E : this._makeAbs(E);
      if (this.mark && (E = this._mark(E)), this.absolute && (E = $), !this.matches[g][E]) {
        if (this.nodir) {
          var A = this.cache[$];
          if (A === "DIR" || Array.isArray(A))
            return;
        }
        this.matches[g][E] = !0;
        var T = this.statCache[$];
        T && this.emit("stat", E, T), this.emit("match", E);
      }
    }
  }, _.prototype._readdirInGlobStar = function(g, E) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(g, !1, E);
    var $ = "lstat\0" + g, A = this, T = m($, b);
    T && A.fs.lstat(g, T);
    function b(I, O) {
      if (I && I.code === "ENOENT")
        return E();
      var L = O && O.isSymbolicLink();
      A.symlinks[g] = L, !L && O && !O.isDirectory() ? (A.cache[g] = "FILE", E()) : A._readdir(g, !1, E);
    }
  }, _.prototype._readdir = function(g, E, $) {
    if (!this.aborted && ($ = m("readdir\0" + g + "\0" + E, $), !!$)) {
      if (E && !d(this.symlinks, g))
        return this._readdirInGlobStar(g, $);
      if (d(this.cache, g)) {
        var A = this.cache[g];
        if (!A || A === "FILE")
          return $();
        if (Array.isArray(A))
          return $(null, A);
      }
      var T = this;
      T.fs.readdir(g, R(this, g, $));
    }
  };
  function R(g, E, $) {
    return function(A, T) {
      A ? g._readdirError(E, A, $) : g._readdirEntries(E, T, $);
    };
  }
  return _.prototype._readdirEntries = function(g, E, $) {
    if (!this.aborted) {
      if (!this.mark && !this.stat)
        for (var A = 0; A < E.length; A++) {
          var T = E[A];
          g === "/" ? T = g + T : T = g + "/" + T, this.cache[T] = !0;
        }
      return this.cache[g] = E, $(null, E);
    }
  }, _.prototype._readdirError = function(g, E, $) {
    if (!this.aborted) {
      switch (E.code) {
        case "ENOTSUP":
        case "ENOTDIR":
          var A = this._makeAbs(g);
          if (this.cache[A] = "FILE", A === this.cwdAbs) {
            var T = new Error(E.code + " invalid cwd " + this.cwd);
            T.path = this.cwd, T.code = E.code, this.emit("error", T), this.abort();
          }
          break;
        case "ENOENT":
        case "ELOOP":
        case "ENAMETOOLONG":
        case "UNKNOWN":
          this.cache[this._makeAbs(g)] = !1;
          break;
        default:
          this.cache[this._makeAbs(g)] = !1, this.strict && (this.emit("error", E), this.abort()), this.silent || console.error("glob error", E);
          break;
      }
      return $();
    }
  }, _.prototype._processGlobStar = function(g, E, $, A, T, b, I) {
    var O = this;
    this._readdir($, b, function(L, B) {
      O._processGlobStar2(g, E, $, A, T, b, B, I);
    });
  }, _.prototype._processGlobStar2 = function(g, E, $, A, T, b, I, O) {
    if (!I)
      return O();
    var L = A.slice(1), B = g ? [g] : [], N = B.concat(L);
    this._process(N, T, !1, O);
    var P = this.symlinks[$], G = I.length;
    if (P && b)
      return O();
    for (var w = 0; w < G; w++) {
      var S = I[w];
      if (!(S.charAt(0) === "." && !this.dot)) {
        var C = B.concat(I[w], L);
        this._process(C, T, !0, O);
        var j = B.concat(I[w], A);
        this._process(j, T, !0, O);
      }
    }
    O();
  }, _.prototype._processSimple = function(g, E, $) {
    var A = this;
    this._stat(g, function(T, b) {
      A._processSimple2(g, E, T, b, $);
    });
  }, _.prototype._processSimple2 = function(g, E, $, A, T) {
    if (this.matches[E] || (this.matches[E] = /* @__PURE__ */ Object.create(null)), !A)
      return T();
    if (g && s(g) && !this.nomount) {
      var b = /[\/\\]$/.test(g);
      g.charAt(0) === "/" ? g = n.join(this.root, g) : (g = n.resolve(this.root, g), b && (g += "/"));
    }
    process.platform === "win32" && (g = g.replace(/\\/g, "/")), this._emitMatch(E, g), T();
  }, _.prototype._stat = function(g, E) {
    var $ = this._makeAbs(g), A = g.slice(-1) === "/";
    if (g.length > this.maxLength)
      return E();
    if (!this.stat && d(this.cache, $)) {
      var T = this.cache[$];
      if (Array.isArray(T) && (T = "DIR"), !A || T === "DIR")
        return E(null, T);
      if (A && T === "FILE")
        return E();
    }
    var b = this.statCache[$];
    if (b !== void 0) {
      if (b === !1)
        return E(null, b);
      var I = b.isDirectory() ? "DIR" : "FILE";
      return A && I === "FILE" ? E() : E(null, I, b);
    }
    var O = this, L = m("stat\0" + $, B);
    L && O.fs.lstat($, L);
    function B(N, P) {
      if (P && P.isSymbolicLink())
        return O.fs.stat($, function(G, w) {
          G ? O._stat2(g, $, null, P, E) : O._stat2(g, $, G, w, E);
        });
      O._stat2(g, $, N, P, E);
    }
  }, _.prototype._stat2 = function(g, E, $, A, T) {
    if ($ && ($.code === "ENOENT" || $.code === "ENOTDIR"))
      return this.statCache[E] = !1, T();
    var b = g.slice(-1) === "/";
    if (this.statCache[E] = A, E.slice(-1) === "/" && A && !A.isDirectory())
      return T(null, !1, A);
    var I = !0;
    return A && (I = A.isDirectory() ? "DIR" : "FILE"), this.cache[E] = this.cache[E] || I, b && I === "FILE" ? T() : T(null, I, A);
  }, $i;
}
const ae = $n, Mo = pe, Xa = Je;
let Nt;
try {
  Nt = Bo();
} catch {
}
const Rh = {
  nosort: !0,
  silent: !0
};
let Ii = 0;
const nr = process.platform === "win32", Uo = (e) => {
  if ([
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((t) => {
    e[t] = e[t] || Xa[t], t = t + "Sync", e[t] = e[t] || Xa[t];
  }), e.maxBusyTries = e.maxBusyTries || 3, e.emfileWait = e.emfileWait || 1e3, e.glob === !1 && (e.disableGlob = !0), e.disableGlob !== !0 && Nt === void 0)
    throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
  e.disableGlob = e.disableGlob || !1, e.glob = e.glob || Rh;
}, Gn = (e, r, t) => {
  typeof r == "function" && (t = r, r = {}), ae(e, "rimraf: missing path"), ae.equal(typeof e, "string", "rimraf: path should be a string"), ae.equal(typeof t, "function", "rimraf: callback function required"), ae(r, "rimraf: invalid options argument provided"), ae.equal(typeof r, "object", "rimraf: options should be object"), Uo(r);
  let i = 0, n = null, a = 0;
  const s = (c) => {
    n = n || c, --a === 0 && t(n);
  }, f = (c, o) => {
    if (c)
      return t(c);
    if (a = o.length, a === 0)
      return t();
    o.forEach((d) => {
      const m = (u) => {
        if (u) {
          if ((u.code === "EBUSY" || u.code === "ENOTEMPTY" || u.code === "EPERM") && i < r.maxBusyTries)
            return i++, setTimeout(() => Ci(d, r, m), i * 100);
          if (u.code === "EMFILE" && Ii < r.emfileWait)
            return setTimeout(() => Ci(d, r, m), Ii++);
          u.code === "ENOENT" && (u = null);
        }
        Ii = 0, s(u);
      };
      Ci(d, r, m);
    });
  };
  if (r.disableGlob || !Nt.hasMagic(e))
    return f(null, [e]);
  r.lstat(e, (c, o) => {
    if (!c)
      return f(null, [e]);
    Nt(e, r.glob, f);
  });
}, Ci = (e, r, t) => {
  ae(e), ae(r), ae(typeof t == "function"), r.lstat(e, (i, n) => {
    if (i && i.code === "ENOENT")
      return t(null);
    if (i && i.code === "EPERM" && nr && Ya(e, r, i, t), n && n.isDirectory())
      return Br(e, r, i, t);
    r.unlink(e, (a) => {
      if (a) {
        if (a.code === "ENOENT")
          return t(null);
        if (a.code === "EPERM")
          return nr ? Ya(e, r, a, t) : Br(e, r, a, t);
        if (a.code === "EISDIR")
          return Br(e, r, a, t);
      }
      return t(a);
    });
  });
}, Ya = (e, r, t, i) => {
  ae(e), ae(r), ae(typeof i == "function"), r.chmod(e, 438, (n) => {
    n ? i(n.code === "ENOENT" ? null : t) : r.stat(e, (a, s) => {
      a ? i(a.code === "ENOENT" ? null : t) : s.isDirectory() ? Br(e, r, t, i) : r.unlink(e, i);
    });
  });
}, Ka = (e, r, t) => {
  ae(e), ae(r);
  try {
    r.chmodSync(e, 438);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    throw t;
  }
  let i;
  try {
    i = r.statSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    throw t;
  }
  i.isDirectory() ? Mr(e, r, t) : r.unlinkSync(e);
}, Br = (e, r, t, i) => {
  ae(e), ae(r), ae(typeof i == "function"), r.rmdir(e, (n) => {
    n && (n.code === "ENOTEMPTY" || n.code === "EEXIST" || n.code === "EPERM") ? Oh(e, r, i) : n && n.code === "ENOTDIR" ? i(t) : i(n);
  });
}, Oh = (e, r, t) => {
  ae(e), ae(r), ae(typeof t == "function"), r.readdir(e, (i, n) => {
    if (i)
      return t(i);
    let a = n.length;
    if (a === 0)
      return r.rmdir(e, t);
    let s;
    n.forEach((f) => {
      Gn(Mo.join(e, f), r, (c) => {
        if (!s) {
          if (c)
            return t(s = c);
          --a === 0 && r.rmdir(e, t);
        }
      });
    });
  });
}, zo = (e, r) => {
  r = r || {}, Uo(r), ae(e, "rimraf: missing path"), ae.equal(typeof e, "string", "rimraf: path should be a string"), ae(r, "rimraf: missing options"), ae.equal(typeof r, "object", "rimraf: options should be object");
  let t;
  if (r.disableGlob || !Nt.hasMagic(e))
    t = [e];
  else
    try {
      r.lstatSync(e), t = [e];
    } catch {
      t = Nt.sync(e, r.glob);
    }
  if (t.length)
    for (let i = 0; i < t.length; i++) {
      const n = t[i];
      let a;
      try {
        a = r.lstatSync(n);
      } catch (s) {
        if (s.code === "ENOENT")
          return;
        s.code === "EPERM" && nr && Ka(n, r, s);
      }
      try {
        a && a.isDirectory() ? Mr(n, r, null) : r.unlinkSync(n);
      } catch (s) {
        if (s.code === "ENOENT")
          return;
        if (s.code === "EPERM")
          return nr ? Ka(n, r, s) : Mr(n, r, s);
        if (s.code !== "EISDIR")
          throw s;
        Mr(n, r, s);
      }
    }
}, Mr = (e, r, t) => {
  ae(e), ae(r);
  try {
    r.rmdirSync(e);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    if (i.code === "ENOTDIR")
      throw t;
    (i.code === "ENOTEMPTY" || i.code === "EEXIST" || i.code === "EPERM") && Th(e, r);
  }
}, Th = (e, r) => {
  ae(e), ae(r), r.readdirSync(e).forEach((n) => zo(Mo.join(e, n), r));
  const t = nr ? 100 : 1;
  let i = 0;
  do {
    let n = !0;
    try {
      const a = r.rmdirSync(e, r);
      return n = !1, a;
    } finally {
      if (++i < t && n)
        continue;
    }
  } while (!0);
};
var Ah = Gn;
Gn.sync = zo;
var Zn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.changePermissions = e.downloadFile = e.getPath = void 0;
  const r = So, t = Je, i = pe, n = Rl, a = () => {
    const o = r.app.getPath("userData");
    return i.resolve(`${o}/extensions`);
  };
  e.getPath = a;
  const s = r.net ? r.net.request : n.get, f = (o, d) => new Promise((m, u) => {
    const h = s(o);
    h.on("response", (p) => {
      if (p.statusCode && p.statusCode >= 300 && p.statusCode < 400 && p.headers.location)
        return e.downloadFile(p.headers.location, d).then(m).catch(u);
      p.pipe(t.createWriteStream(d)).on("close", m), p.on("error", u);
    }), h.on("error", u), h.end();
  });
  e.downloadFile = f;
  const c = (o, d) => {
    t.readdirSync(o).forEach((u) => {
      const h = i.join(o, u);
      t.chmodSync(h, parseInt(`${d}`, 8)), t.statSync(h).isDirectory() && e.changePermissions(h, d);
    });
  };
  e.changePermissions = c;
})(Zn);
var jt = {}, Ni = {}, he = {}, Rr = { exports: {} }, Or = { exports: {} }, Ja;
function ai() {
  if (Ja) return Or.exports;
  Ja = 1, typeof process > "u" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0 ? Or.exports = { nextTick: e } : Or.exports = process;
  function e(r, t, i, n) {
    if (typeof r != "function")
      throw new TypeError('"callback" argument must be a function');
    var a = arguments.length, s, f;
    switch (a) {
      case 0:
      case 1:
        return process.nextTick(r);
      case 2:
        return process.nextTick(function() {
          r.call(null, t);
        });
      case 3:
        return process.nextTick(function() {
          r.call(null, t, i);
        });
      case 4:
        return process.nextTick(function() {
          r.call(null, t, i, n);
        });
      default:
        for (s = new Array(a - 1), f = 0; f < s.length; )
          s[f++] = arguments[f];
        return process.nextTick(function() {
          r.apply(null, s);
        });
    }
  }
  return Or.exports;
}
var Li, Qa;
function $h() {
  if (Qa) return Li;
  Qa = 1;
  var e = {}.toString;
  return Li = Array.isArray || function(r) {
    return e.call(r) == "[object Array]";
  }, Li;
}
var Di, es;
function Go() {
  return es || (es = 1, Di = Ro), Di;
}
var Tr = { exports: {} }, ts;
function si() {
  return ts || (ts = 1, function(e, r) {
    var t = Oo, i = t.Buffer;
    function n(s, f) {
      for (var c in s)
        f[c] = s[c];
    }
    i.from && i.alloc && i.allocUnsafe && i.allocUnsafeSlow ? e.exports = t : (n(t, r), r.Buffer = a);
    function a(s, f, c) {
      return i(s, f, c);
    }
    n(i, a), a.from = function(s, f, c) {
      if (typeof s == "number")
        throw new TypeError("Argument must not be a number");
      return i(s, f, c);
    }, a.alloc = function(s, f, c) {
      if (typeof s != "number")
        throw new TypeError("Argument must be a number");
      var o = i(s);
      return f !== void 0 ? typeof c == "string" ? o.fill(f, c) : o.fill(f) : o.fill(0), o;
    }, a.allocUnsafe = function(s) {
      if (typeof s != "number")
        throw new TypeError("Argument must be a number");
      return i(s);
    }, a.allocUnsafeSlow = function(s) {
      if (typeof s != "number")
        throw new TypeError("Argument must be a number");
      return t.SlowBuffer(s);
    };
  }(Tr, Tr.exports)), Tr.exports;
}
var _e = {}, rs;
function cr() {
  if (rs) return _e;
  rs = 1;
  function e(v) {
    return Array.isArray ? Array.isArray(v) : p(v) === "[object Array]";
  }
  _e.isArray = e;
  function r(v) {
    return typeof v == "boolean";
  }
  _e.isBoolean = r;
  function t(v) {
    return v === null;
  }
  _e.isNull = t;
  function i(v) {
    return v == null;
  }
  _e.isNullOrUndefined = i;
  function n(v) {
    return typeof v == "number";
  }
  _e.isNumber = n;
  function a(v) {
    return typeof v == "string";
  }
  _e.isString = a;
  function s(v) {
    return typeof v == "symbol";
  }
  _e.isSymbol = s;
  function f(v) {
    return v === void 0;
  }
  _e.isUndefined = f;
  function c(v) {
    return p(v) === "[object RegExp]";
  }
  _e.isRegExp = c;
  function o(v) {
    return typeof v == "object" && v !== null;
  }
  _e.isObject = o;
  function d(v) {
    return p(v) === "[object Date]";
  }
  _e.isDate = d;
  function m(v) {
    return p(v) === "[object Error]" || v instanceof Error;
  }
  _e.isError = m;
  function u(v) {
    return typeof v == "function";
  }
  _e.isFunction = u;
  function h(v) {
    return v === null || typeof v == "boolean" || typeof v == "number" || typeof v == "string" || typeof v == "symbol" || // ES6 symbol
    typeof v > "u";
  }
  _e.isPrimitive = h, _e.isBuffer = Oo.Buffer.isBuffer;
  function p(v) {
    return Object.prototype.toString.call(v);
  }
  return _e;
}
var Pi = { exports: {} }, is;
function Ih() {
  return is || (is = 1, function(e) {
    function r(a, s) {
      if (!(a instanceof s))
        throw new TypeError("Cannot call a class as a function");
    }
    var t = si().Buffer, i = In;
    function n(a, s, f) {
      a.copy(s, f);
    }
    e.exports = function() {
      function a() {
        r(this, a), this.head = null, this.tail = null, this.length = 0;
      }
      return a.prototype.push = function(f) {
        var c = { data: f, next: null };
        this.length > 0 ? this.tail.next = c : this.head = c, this.tail = c, ++this.length;
      }, a.prototype.unshift = function(f) {
        var c = { data: f, next: this.head };
        this.length === 0 && (this.tail = c), this.head = c, ++this.length;
      }, a.prototype.shift = function() {
        if (this.length !== 0) {
          var f = this.head.data;
          return this.length === 1 ? this.head = this.tail = null : this.head = this.head.next, --this.length, f;
        }
      }, a.prototype.clear = function() {
        this.head = this.tail = null, this.length = 0;
      }, a.prototype.join = function(f) {
        if (this.length === 0) return "";
        for (var c = this.head, o = "" + c.data; c = c.next; )
          o += f + c.data;
        return o;
      }, a.prototype.concat = function(f) {
        if (this.length === 0) return t.alloc(0);
        for (var c = t.allocUnsafe(f >>> 0), o = this.head, d = 0; o; )
          n(o.data, c, d), d += o.data.length, o = o.next;
        return c;
      }, a;
    }(), i && i.inspect && i.inspect.custom && (e.exports.prototype[i.inspect.custom] = function() {
      var a = i.inspect({ length: this.length });
      return this.constructor.name + " " + a;
    });
  }(Pi)), Pi.exports;
}
var ji, ns;
function Zo() {
  if (ns) return ji;
  ns = 1;
  var e = ai();
  function r(n, a) {
    var s = this, f = this._readableState && this._readableState.destroyed, c = this._writableState && this._writableState.destroyed;
    return f || c ? (a ? a(n) : n && (this._writableState ? this._writableState.errorEmitted || (this._writableState.errorEmitted = !0, e.nextTick(i, this, n)) : e.nextTick(i, this, n)), this) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), this._destroy(n || null, function(o) {
      !a && o ? s._writableState ? s._writableState.errorEmitted || (s._writableState.errorEmitted = !0, e.nextTick(i, s, o)) : e.nextTick(i, s, o) : a && a(o);
    }), this);
  }
  function t() {
    this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finalCalled = !1, this._writableState.prefinished = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1);
  }
  function i(n, a) {
    n.emit("error", a);
  }
  return ji = {
    destroy: r,
    undestroy: t
  }, ji;
}
var Fi, as;
function Ch() {
  return as || (as = 1, Fi = In.deprecate), Fi;
}
var Bi, ss;
function Wo() {
  if (ss) return Bi;
  ss = 1;
  var e = ai();
  Bi = v;
  function r(w) {
    var S = this;
    this.next = null, this.entry = null, this.finish = function() {
      G(S, w);
    };
  }
  var t = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : e.nextTick, i;
  v.WritableState = h;
  var n = Object.create(cr());
  n.inherits = Pt();
  var a = {
    deprecate: Ch()
  }, s = Go(), f = si().Buffer, c = (typeof ve < "u" ? ve : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function o(w) {
    return f.from(w);
  }
  function d(w) {
    return f.isBuffer(w) || w instanceof c;
  }
  var m = Zo();
  n.inherits(v, s);
  function u() {
  }
  function h(w, S) {
    i = i || Lt(), w = w || {};
    var C = S instanceof i;
    this.objectMode = !!w.objectMode, C && (this.objectMode = this.objectMode || !!w.writableObjectMode);
    var j = w.highWaterMark, U = w.writableHighWaterMark, Z = this.objectMode ? 16 : 16 * 1024;
    j || j === 0 ? this.highWaterMark = j : C && (U || U === 0) ? this.highWaterMark = U : this.highWaterMark = Z, this.highWaterMark = Math.floor(this.highWaterMark), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
    var H = w.decodeStrings === !1;
    this.decodeStrings = !H, this.defaultEncoding = w.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(X) {
      A(S, X);
    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new r(this);
  }
  h.prototype.getBuffer = function() {
    for (var S = this.bufferedRequest, C = []; S; )
      C.push(S), S = S.next;
    return C;
  }, function() {
    try {
      Object.defineProperty(h.prototype, "buffer", {
        get: a.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch {
    }
  }();
  var p;
  typeof Symbol == "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] == "function" ? (p = Function.prototype[Symbol.hasInstance], Object.defineProperty(v, Symbol.hasInstance, {
    value: function(w) {
      return p.call(this, w) ? !0 : this !== v ? !1 : w && w._writableState instanceof h;
    }
  })) : p = function(w) {
    return w instanceof this;
  };
  function v(w) {
    if (i = i || Lt(), !p.call(v, this) && !(this instanceof i))
      return new v(w);
    this._writableState = new h(w, this), this.writable = !0, w && (typeof w.write == "function" && (this._write = w.write), typeof w.writev == "function" && (this._writev = w.writev), typeof w.destroy == "function" && (this._destroy = w.destroy), typeof w.final == "function" && (this._final = w.final)), s.call(this);
  }
  v.prototype.pipe = function() {
    this.emit("error", new Error("Cannot pipe, not readable"));
  };
  function x(w, S) {
    var C = new Error("write after end");
    w.emit("error", C), e.nextTick(S, C);
  }
  function l(w, S, C, j) {
    var U = !0, Z = !1;
    return C === null ? Z = new TypeError("May not write null values to stream") : typeof C != "string" && C !== void 0 && !S.objectMode && (Z = new TypeError("Invalid non-string/buffer chunk")), Z && (w.emit("error", Z), e.nextTick(j, Z), U = !1), U;
  }
  v.prototype.write = function(w, S, C) {
    var j = this._writableState, U = !1, Z = !j.objectMode && d(w);
    return Z && !f.isBuffer(w) && (w = o(w)), typeof S == "function" && (C = S, S = null), Z ? S = "buffer" : S || (S = j.defaultEncoding), typeof C != "function" && (C = u), j.ended ? x(this, C) : (Z || l(this, j, w, C)) && (j.pendingcb++, U = R(this, j, Z, w, S, C)), U;
  }, v.prototype.cork = function() {
    var w = this._writableState;
    w.corked++;
  }, v.prototype.uncork = function() {
    var w = this._writableState;
    w.corked && (w.corked--, !w.writing && !w.corked && !w.bufferProcessing && w.bufferedRequest && I(this, w));
  }, v.prototype.setDefaultEncoding = function(S) {
    if (typeof S == "string" && (S = S.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((S + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + S);
    return this._writableState.defaultEncoding = S, this;
  };
  function _(w, S, C) {
    return !w.objectMode && w.decodeStrings !== !1 && typeof S == "string" && (S = f.from(S, C)), S;
  }
  Object.defineProperty(v.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function R(w, S, C, j, U, Z) {
    if (!C) {
      var H = _(S, j, U);
      j !== H && (C = !0, U = "buffer", j = H);
    }
    var X = S.objectMode ? 1 : j.length;
    S.length += X;
    var Q = S.length < S.highWaterMark;
    if (Q || (S.needDrain = !0), S.writing || S.corked) {
      var Y = S.lastBufferedRequest;
      S.lastBufferedRequest = {
        chunk: j,
        encoding: U,
        isBuf: C,
        callback: Z,
        next: null
      }, Y ? Y.next = S.lastBufferedRequest : S.bufferedRequest = S.lastBufferedRequest, S.bufferedRequestCount += 1;
    } else
      g(w, S, !1, X, j, U, Z);
    return Q;
  }
  function g(w, S, C, j, U, Z, H) {
    S.writelen = j, S.writecb = H, S.writing = !0, S.sync = !0, C ? w._writev(U, S.onwrite) : w._write(U, Z, S.onwrite), S.sync = !1;
  }
  function E(w, S, C, j, U) {
    --S.pendingcb, C ? (e.nextTick(U, j), e.nextTick(N, w, S), w._writableState.errorEmitted = !0, w.emit("error", j)) : (U(j), w._writableState.errorEmitted = !0, w.emit("error", j), N(w, S));
  }
  function $(w) {
    w.writing = !1, w.writecb = null, w.length -= w.writelen, w.writelen = 0;
  }
  function A(w, S) {
    var C = w._writableState, j = C.sync, U = C.writecb;
    if ($(C), S) E(w, C, j, S, U);
    else {
      var Z = O(C);
      !Z && !C.corked && !C.bufferProcessing && C.bufferedRequest && I(w, C), j ? t(T, w, C, Z, U) : T(w, C, Z, U);
    }
  }
  function T(w, S, C, j) {
    C || b(w, S), S.pendingcb--, j(), N(w, S);
  }
  function b(w, S) {
    S.length === 0 && S.needDrain && (S.needDrain = !1, w.emit("drain"));
  }
  function I(w, S) {
    S.bufferProcessing = !0;
    var C = S.bufferedRequest;
    if (w._writev && C && C.next) {
      var j = S.bufferedRequestCount, U = new Array(j), Z = S.corkedRequestsFree;
      Z.entry = C;
      for (var H = 0, X = !0; C; )
        U[H] = C, C.isBuf || (X = !1), C = C.next, H += 1;
      U.allBuffers = X, g(w, S, !0, S.length, U, "", Z.finish), S.pendingcb++, S.lastBufferedRequest = null, Z.next ? (S.corkedRequestsFree = Z.next, Z.next = null) : S.corkedRequestsFree = new r(S), S.bufferedRequestCount = 0;
    } else {
      for (; C; ) {
        var Q = C.chunk, Y = C.encoding, y = C.callback, k = S.objectMode ? 1 : Q.length;
        if (g(w, S, !1, k, Q, Y, y), C = C.next, S.bufferedRequestCount--, S.writing)
          break;
      }
      C === null && (S.lastBufferedRequest = null);
    }
    S.bufferedRequest = C, S.bufferProcessing = !1;
  }
  v.prototype._write = function(w, S, C) {
    C(new Error("_write() is not implemented"));
  }, v.prototype._writev = null, v.prototype.end = function(w, S, C) {
    var j = this._writableState;
    typeof w == "function" ? (C = w, w = null, S = null) : typeof S == "function" && (C = S, S = null), w != null && this.write(w, S), j.corked && (j.corked = 1, this.uncork()), j.ending || P(this, j, C);
  };
  function O(w) {
    return w.ending && w.length === 0 && w.bufferedRequest === null && !w.finished && !w.writing;
  }
  function L(w, S) {
    w._final(function(C) {
      S.pendingcb--, C && w.emit("error", C), S.prefinished = !0, w.emit("prefinish"), N(w, S);
    });
  }
  function B(w, S) {
    !S.prefinished && !S.finalCalled && (typeof w._final == "function" ? (S.pendingcb++, S.finalCalled = !0, e.nextTick(L, w, S)) : (S.prefinished = !0, w.emit("prefinish")));
  }
  function N(w, S) {
    var C = O(S);
    return C && (B(w, S), S.pendingcb === 0 && (S.finished = !0, w.emit("finish"))), C;
  }
  function P(w, S, C) {
    S.ending = !0, N(w, S), C && (S.finished ? e.nextTick(C) : w.once("finish", C)), S.ended = !0, w.writable = !1;
  }
  function G(w, S, C) {
    var j = w.entry;
    for (w.entry = null; j; ) {
      var U = j.callback;
      S.pendingcb--, U(C), j = j.next;
    }
    S.corkedRequestsFree.next = w;
  }
  return Object.defineProperty(v.prototype, "destroyed", {
    get: function() {
      return this._writableState === void 0 ? !1 : this._writableState.destroyed;
    },
    set: function(w) {
      this._writableState && (this._writableState.destroyed = w);
    }
  }), v.prototype.destroy = m.destroy, v.prototype._undestroy = m.undestroy, v.prototype._destroy = function(w, S) {
    this.end(), S(w);
  }, Bi;
}
var Mi, os;
function Lt() {
  if (os) return Mi;
  os = 1;
  var e = ai(), r = Object.keys || function(m) {
    var u = [];
    for (var h in m)
      u.push(h);
    return u;
  };
  Mi = c;
  var t = Object.create(cr());
  t.inherits = Pt();
  var i = qo(), n = Wo();
  t.inherits(c, i);
  for (var a = r(n.prototype), s = 0; s < a.length; s++) {
    var f = a[s];
    c.prototype[f] || (c.prototype[f] = n.prototype[f]);
  }
  function c(m) {
    if (!(this instanceof c)) return new c(m);
    i.call(this, m), n.call(this, m), m && m.readable === !1 && (this.readable = !1), m && m.writable === !1 && (this.writable = !1), this.allowHalfOpen = !0, m && m.allowHalfOpen === !1 && (this.allowHalfOpen = !1), this.once("end", o);
  }
  Object.defineProperty(c.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function o() {
    this.allowHalfOpen || this._writableState.ended || e.nextTick(d, this);
  }
  function d(m) {
    m.end();
  }
  return Object.defineProperty(c.prototype, "destroyed", {
    get: function() {
      return this._readableState === void 0 || this._writableState === void 0 ? !1 : this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(m) {
      this._readableState === void 0 || this._writableState === void 0 || (this._readableState.destroyed = m, this._writableState.destroyed = m);
    }
  }), c.prototype._destroy = function(m, u) {
    this.push(null), this.end(), e.nextTick(u, m);
  }, Mi;
}
var Ui = {}, fs;
function ls() {
  if (fs) return Ui;
  fs = 1;
  var e = si().Buffer, r = e.isEncoding || function(l) {
    switch (l = "" + l, l && l.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return !0;
      default:
        return !1;
    }
  };
  function t(l) {
    if (!l) return "utf8";
    for (var _; ; )
      switch (l) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return l;
        default:
          if (_) return;
          l = ("" + l).toLowerCase(), _ = !0;
      }
  }
  function i(l) {
    var _ = t(l);
    if (typeof _ != "string" && (e.isEncoding === r || !r(l))) throw new Error("Unknown encoding: " + l);
    return _ || l;
  }
  Ui.StringDecoder = n;
  function n(l) {
    this.encoding = i(l);
    var _;
    switch (this.encoding) {
      case "utf16le":
        this.text = m, this.end = u, _ = 4;
        break;
      case "utf8":
        this.fillLast = c, _ = 4;
        break;
      case "base64":
        this.text = h, this.end = p, _ = 3;
        break;
      default:
        this.write = v, this.end = x;
        return;
    }
    this.lastNeed = 0, this.lastTotal = 0, this.lastChar = e.allocUnsafe(_);
  }
  n.prototype.write = function(l) {
    if (l.length === 0) return "";
    var _, R;
    if (this.lastNeed) {
      if (_ = this.fillLast(l), _ === void 0) return "";
      R = this.lastNeed, this.lastNeed = 0;
    } else
      R = 0;
    return R < l.length ? _ ? _ + this.text(l, R) : this.text(l, R) : _ || "";
  }, n.prototype.end = d, n.prototype.text = o, n.prototype.fillLast = function(l) {
    if (this.lastNeed <= l.length)
      return l.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    l.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, l.length), this.lastNeed -= l.length;
  };
  function a(l) {
    return l <= 127 ? 0 : l >> 5 === 6 ? 2 : l >> 4 === 14 ? 3 : l >> 3 === 30 ? 4 : l >> 6 === 2 ? -1 : -2;
  }
  function s(l, _, R) {
    var g = _.length - 1;
    if (g < R) return 0;
    var E = a(_[g]);
    return E >= 0 ? (E > 0 && (l.lastNeed = E - 1), E) : --g < R || E === -2 ? 0 : (E = a(_[g]), E >= 0 ? (E > 0 && (l.lastNeed = E - 2), E) : --g < R || E === -2 ? 0 : (E = a(_[g]), E >= 0 ? (E > 0 && (E === 2 ? E = 0 : l.lastNeed = E - 3), E) : 0));
  }
  function f(l, _, R) {
    if ((_[0] & 192) !== 128)
      return l.lastNeed = 0, "�";
    if (l.lastNeed > 1 && _.length > 1) {
      if ((_[1] & 192) !== 128)
        return l.lastNeed = 1, "�";
      if (l.lastNeed > 2 && _.length > 2 && (_[2] & 192) !== 128)
        return l.lastNeed = 2, "�";
    }
  }
  function c(l) {
    var _ = this.lastTotal - this.lastNeed, R = f(this, l);
    if (R !== void 0) return R;
    if (this.lastNeed <= l.length)
      return l.copy(this.lastChar, _, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    l.copy(this.lastChar, _, 0, l.length), this.lastNeed -= l.length;
  }
  function o(l, _) {
    var R = s(this, l, _);
    if (!this.lastNeed) return l.toString("utf8", _);
    this.lastTotal = R;
    var g = l.length - (R - this.lastNeed);
    return l.copy(this.lastChar, 0, g), l.toString("utf8", _, g);
  }
  function d(l) {
    var _ = l && l.length ? this.write(l) : "";
    return this.lastNeed ? _ + "�" : _;
  }
  function m(l, _) {
    if ((l.length - _) % 2 === 0) {
      var R = l.toString("utf16le", _);
      if (R) {
        var g = R.charCodeAt(R.length - 1);
        if (g >= 55296 && g <= 56319)
          return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = l[l.length - 2], this.lastChar[1] = l[l.length - 1], R.slice(0, -1);
      }
      return R;
    }
    return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = l[l.length - 1], l.toString("utf16le", _, l.length - 1);
  }
  function u(l) {
    var _ = l && l.length ? this.write(l) : "";
    if (this.lastNeed) {
      var R = this.lastTotal - this.lastNeed;
      return _ + this.lastChar.toString("utf16le", 0, R);
    }
    return _;
  }
  function h(l, _) {
    var R = (l.length - _) % 3;
    return R === 0 ? l.toString("base64", _) : (this.lastNeed = 3 - R, this.lastTotal = 3, R === 1 ? this.lastChar[0] = l[l.length - 1] : (this.lastChar[0] = l[l.length - 2], this.lastChar[1] = l[l.length - 1]), l.toString("base64", _, l.length - R));
  }
  function p(l) {
    var _ = l && l.length ? this.write(l) : "";
    return this.lastNeed ? _ + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : _;
  }
  function v(l) {
    return l.toString(this.encoding);
  }
  function x(l) {
    return l && l.length ? this.write(l) : "";
  }
  return Ui;
}
var zi, us;
function qo() {
  if (us) return zi;
  us = 1;
  var e = ai();
  zi = _;
  var r = $h(), t;
  _.ReadableState = l, xo.EventEmitter;
  var i = function(y, k) {
    return y.listeners(k).length;
  }, n = Go(), a = si().Buffer, s = (typeof ve < "u" ? ve : typeof window < "u" ? window : typeof self < "u" ? self : {}).Uint8Array || function() {
  };
  function f(y) {
    return a.from(y);
  }
  function c(y) {
    return a.isBuffer(y) || y instanceof s;
  }
  var o = Object.create(cr());
  o.inherits = Pt();
  var d = In, m = void 0;
  d && d.debuglog ? m = d.debuglog("stream") : m = function() {
  };
  var u = Ih(), h = Zo(), p;
  o.inherits(_, n);
  var v = ["error", "close", "destroy", "pause", "resume"];
  function x(y, k, M) {
    if (typeof y.prependListener == "function") return y.prependListener(k, M);
    !y._events || !y._events[k] ? y.on(k, M) : r(y._events[k]) ? y._events[k].unshift(M) : y._events[k] = [M, y._events[k]];
  }
  function l(y, k) {
    t = t || Lt(), y = y || {};
    var M = k instanceof t;
    this.objectMode = !!y.objectMode, M && (this.objectMode = this.objectMode || !!y.readableObjectMode);
    var W = y.highWaterMark, ee = y.readableHighWaterMark, V = this.objectMode ? 16 : 16 * 1024;
    W || W === 0 ? this.highWaterMark = W : M && (ee || ee === 0) ? this.highWaterMark = ee : this.highWaterMark = V, this.highWaterMark = Math.floor(this.highWaterMark), this.buffer = new u(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.destroyed = !1, this.defaultEncoding = y.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, y.encoding && (p || (p = ls().StringDecoder), this.decoder = new p(y.encoding), this.encoding = y.encoding);
  }
  function _(y) {
    if (t = t || Lt(), !(this instanceof _)) return new _(y);
    this._readableState = new l(y, this), this.readable = !0, y && (typeof y.read == "function" && (this._read = y.read), typeof y.destroy == "function" && (this._destroy = y.destroy)), n.call(this);
  }
  Object.defineProperty(_.prototype, "destroyed", {
    get: function() {
      return this._readableState === void 0 ? !1 : this._readableState.destroyed;
    },
    set: function(y) {
      this._readableState && (this._readableState.destroyed = y);
    }
  }), _.prototype.destroy = h.destroy, _.prototype._undestroy = h.undestroy, _.prototype._destroy = function(y, k) {
    this.push(null), k(y);
  }, _.prototype.push = function(y, k) {
    var M = this._readableState, W;
    return M.objectMode ? W = !0 : typeof y == "string" && (k = k || M.defaultEncoding, k !== M.encoding && (y = a.from(y, k), k = ""), W = !0), R(this, y, k, !1, W);
  }, _.prototype.unshift = function(y) {
    return R(this, y, null, !0, !1);
  };
  function R(y, k, M, W, ee) {
    var V = y._readableState;
    if (k === null)
      V.reading = !1, I(y, V);
    else {
      var K;
      ee || (K = E(V, k)), K ? y.emit("error", K) : V.objectMode || k && k.length > 0 ? (typeof k != "string" && !V.objectMode && Object.getPrototypeOf(k) !== a.prototype && (k = f(k)), W ? V.endEmitted ? y.emit("error", new Error("stream.unshift() after end event")) : g(y, V, k, !0) : V.ended ? y.emit("error", new Error("stream.push() after EOF")) : (V.reading = !1, V.decoder && !M ? (k = V.decoder.write(k), V.objectMode || k.length !== 0 ? g(y, V, k, !1) : B(y, V)) : g(y, V, k, !1))) : W || (V.reading = !1);
    }
    return $(V);
  }
  function g(y, k, M, W) {
    k.flowing && k.length === 0 && !k.sync ? (y.emit("data", M), y.read(0)) : (k.length += k.objectMode ? 1 : M.length, W ? k.buffer.unshift(M) : k.buffer.push(M), k.needReadable && O(y)), B(y, k);
  }
  function E(y, k) {
    var M;
    return !c(k) && typeof k != "string" && k !== void 0 && !y.objectMode && (M = new TypeError("Invalid non-string/buffer chunk")), M;
  }
  function $(y) {
    return !y.ended && (y.needReadable || y.length < y.highWaterMark || y.length === 0);
  }
  _.prototype.isPaused = function() {
    return this._readableState.flowing === !1;
  }, _.prototype.setEncoding = function(y) {
    return p || (p = ls().StringDecoder), this._readableState.decoder = new p(y), this._readableState.encoding = y, this;
  };
  var A = 8388608;
  function T(y) {
    return y >= A ? y = A : (y--, y |= y >>> 1, y |= y >>> 2, y |= y >>> 4, y |= y >>> 8, y |= y >>> 16, y++), y;
  }
  function b(y, k) {
    return y <= 0 || k.length === 0 && k.ended ? 0 : k.objectMode ? 1 : y !== y ? k.flowing && k.length ? k.buffer.head.data.length : k.length : (y > k.highWaterMark && (k.highWaterMark = T(y)), y <= k.length ? y : k.ended ? k.length : (k.needReadable = !0, 0));
  }
  _.prototype.read = function(y) {
    m("read", y), y = parseInt(y, 10);
    var k = this._readableState, M = y;
    if (y !== 0 && (k.emittedReadable = !1), y === 0 && k.needReadable && (k.length >= k.highWaterMark || k.ended))
      return m("read: emitReadable", k.length, k.ended), k.length === 0 && k.ended ? X(this) : O(this), null;
    if (y = b(y, k), y === 0 && k.ended)
      return k.length === 0 && X(this), null;
    var W = k.needReadable;
    m("need readable", W), (k.length === 0 || k.length - y < k.highWaterMark) && (W = !0, m("length less than watermark", W)), k.ended || k.reading ? (W = !1, m("reading or ended", W)) : W && (m("do read"), k.reading = !0, k.sync = !0, k.length === 0 && (k.needReadable = !0), this._read(k.highWaterMark), k.sync = !1, k.reading || (y = b(M, k)));
    var ee;
    return y > 0 ? ee = j(y, k) : ee = null, ee === null ? (k.needReadable = !0, y = 0) : k.length -= y, k.length === 0 && (k.ended || (k.needReadable = !0), M !== y && k.ended && X(this)), ee !== null && this.emit("data", ee), ee;
  };
  function I(y, k) {
    if (!k.ended) {
      if (k.decoder) {
        var M = k.decoder.end();
        M && M.length && (k.buffer.push(M), k.length += k.objectMode ? 1 : M.length);
      }
      k.ended = !0, O(y);
    }
  }
  function O(y) {
    var k = y._readableState;
    k.needReadable = !1, k.emittedReadable || (m("emitReadable", k.flowing), k.emittedReadable = !0, k.sync ? e.nextTick(L, y) : L(y));
  }
  function L(y) {
    m("emit readable"), y.emit("readable"), C(y);
  }
  function B(y, k) {
    k.readingMore || (k.readingMore = !0, e.nextTick(N, y, k));
  }
  function N(y, k) {
    for (var M = k.length; !k.reading && !k.flowing && !k.ended && k.length < k.highWaterMark && (m("maybeReadMore read 0"), y.read(0), M !== k.length); )
      M = k.length;
    k.readingMore = !1;
  }
  _.prototype._read = function(y) {
    this.emit("error", new Error("_read() is not implemented"));
  }, _.prototype.pipe = function(y, k) {
    var M = this, W = this._readableState;
    switch (W.pipesCount) {
      case 0:
        W.pipes = y;
        break;
      case 1:
        W.pipes = [W.pipes, y];
        break;
      default:
        W.pipes.push(y);
        break;
    }
    W.pipesCount += 1, m("pipe count=%d opts=%j", W.pipesCount, k);
    var ee = (!k || k.end !== !1) && y !== process.stdout && y !== process.stderr, V = ee ? Ee : F;
    W.endEmitted ? e.nextTick(V) : M.once("end", V), y.on("unpipe", K);
    function K(z, q) {
      m("onunpipe"), z === M && q && q.hasUnpiped === !1 && (q.hasUnpiped = !0, bt());
    }
    function Ee() {
      m("onend"), y.end();
    }
    var Ze = P(M);
    y.on("drain", Ze);
    var lt = !1;
    function bt() {
      m("cleanup"), y.removeListener("close", He), y.removeListener("finish", D), y.removeListener("drain", Ze), y.removeListener("error", qe), y.removeListener("unpipe", K), M.removeListener("end", Ee), M.removeListener("end", F), M.removeListener("data", We), lt = !0, W.awaitDrain && (!y._writableState || y._writableState.needDrain) && Ze();
    }
    var se = !1;
    M.on("data", We);
    function We(z) {
      m("ondata"), se = !1;
      var q = y.write(z);
      q === !1 && !se && ((W.pipesCount === 1 && W.pipes === y || W.pipesCount > 1 && Y(W.pipes, y) !== -1) && !lt && (m("false write response, pause", W.awaitDrain), W.awaitDrain++, se = !0), M.pause());
    }
    function qe(z) {
      m("onerror", z), F(), y.removeListener("error", qe), i(y, "error") === 0 && y.emit("error", z);
    }
    x(y, "error", qe);
    function He() {
      y.removeListener("finish", D), F();
    }
    y.once("close", He);
    function D() {
      m("onfinish"), y.removeListener("close", He), F();
    }
    y.once("finish", D);
    function F() {
      m("unpipe"), M.unpipe(y);
    }
    return y.emit("pipe", M), W.flowing || (m("pipe resume"), M.resume()), y;
  };
  function P(y) {
    return function() {
      var k = y._readableState;
      m("pipeOnDrain", k.awaitDrain), k.awaitDrain && k.awaitDrain--, k.awaitDrain === 0 && i(y, "data") && (k.flowing = !0, C(y));
    };
  }
  _.prototype.unpipe = function(y) {
    var k = this._readableState, M = { hasUnpiped: !1 };
    if (k.pipesCount === 0) return this;
    if (k.pipesCount === 1)
      return y && y !== k.pipes ? this : (y || (y = k.pipes), k.pipes = null, k.pipesCount = 0, k.flowing = !1, y && y.emit("unpipe", this, M), this);
    if (!y) {
      var W = k.pipes, ee = k.pipesCount;
      k.pipes = null, k.pipesCount = 0, k.flowing = !1;
      for (var V = 0; V < ee; V++)
        W[V].emit("unpipe", this, { hasUnpiped: !1 });
      return this;
    }
    var K = Y(k.pipes, y);
    return K === -1 ? this : (k.pipes.splice(K, 1), k.pipesCount -= 1, k.pipesCount === 1 && (k.pipes = k.pipes[0]), y.emit("unpipe", this, M), this);
  }, _.prototype.on = function(y, k) {
    var M = n.prototype.on.call(this, y, k);
    if (y === "data")
      this._readableState.flowing !== !1 && this.resume();
    else if (y === "readable") {
      var W = this._readableState;
      !W.endEmitted && !W.readableListening && (W.readableListening = W.needReadable = !0, W.emittedReadable = !1, W.reading ? W.length && O(this) : e.nextTick(G, this));
    }
    return M;
  }, _.prototype.addListener = _.prototype.on;
  function G(y) {
    m("readable nexttick read 0"), y.read(0);
  }
  _.prototype.resume = function() {
    var y = this._readableState;
    return y.flowing || (m("resume"), y.flowing = !0, w(this, y)), this;
  };
  function w(y, k) {
    k.resumeScheduled || (k.resumeScheduled = !0, e.nextTick(S, y, k));
  }
  function S(y, k) {
    k.reading || (m("resume read 0"), y.read(0)), k.resumeScheduled = !1, k.awaitDrain = 0, y.emit("resume"), C(y), k.flowing && !k.reading && y.read(0);
  }
  _.prototype.pause = function() {
    return m("call pause flowing=%j", this._readableState.flowing), this._readableState.flowing !== !1 && (m("pause"), this._readableState.flowing = !1, this.emit("pause")), this;
  };
  function C(y) {
    var k = y._readableState;
    for (m("flow", k.flowing); k.flowing && y.read() !== null; )
      ;
  }
  _.prototype.wrap = function(y) {
    var k = this, M = this._readableState, W = !1;
    y.on("end", function() {
      if (m("wrapped end"), M.decoder && !M.ended) {
        var K = M.decoder.end();
        K && K.length && k.push(K);
      }
      k.push(null);
    }), y.on("data", function(K) {
      if (m("wrapped data"), M.decoder && (K = M.decoder.write(K)), !(M.objectMode && K == null) && !(!M.objectMode && (!K || !K.length))) {
        var Ee = k.push(K);
        Ee || (W = !0, y.pause());
      }
    });
    for (var ee in y)
      this[ee] === void 0 && typeof y[ee] == "function" && (this[ee] = /* @__PURE__ */ function(K) {
        return function() {
          return y[K].apply(y, arguments);
        };
      }(ee));
    for (var V = 0; V < v.length; V++)
      y.on(v[V], this.emit.bind(this, v[V]));
    return this._read = function(K) {
      m("wrapped _read", K), W && (W = !1, y.resume());
    }, this;
  }, Object.defineProperty(_.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: !1,
    get: function() {
      return this._readableState.highWaterMark;
    }
  }), _._fromList = j;
  function j(y, k) {
    if (k.length === 0) return null;
    var M;
    return k.objectMode ? M = k.buffer.shift() : !y || y >= k.length ? (k.decoder ? M = k.buffer.join("") : k.buffer.length === 1 ? M = k.buffer.head.data : M = k.buffer.concat(k.length), k.buffer.clear()) : M = U(y, k.buffer, k.decoder), M;
  }
  function U(y, k, M) {
    var W;
    return y < k.head.data.length ? (W = k.head.data.slice(0, y), k.head.data = k.head.data.slice(y)) : y === k.head.data.length ? W = k.shift() : W = M ? Z(y, k) : H(y, k), W;
  }
  function Z(y, k) {
    var M = k.head, W = 1, ee = M.data;
    for (y -= ee.length; M = M.next; ) {
      var V = M.data, K = y > V.length ? V.length : y;
      if (K === V.length ? ee += V : ee += V.slice(0, y), y -= K, y === 0) {
        K === V.length ? (++W, M.next ? k.head = M.next : k.head = k.tail = null) : (k.head = M, M.data = V.slice(K));
        break;
      }
      ++W;
    }
    return k.length -= W, ee;
  }
  function H(y, k) {
    var M = a.allocUnsafe(y), W = k.head, ee = 1;
    for (W.data.copy(M), y -= W.data.length; W = W.next; ) {
      var V = W.data, K = y > V.length ? V.length : y;
      if (V.copy(M, M.length - y, 0, K), y -= K, y === 0) {
        K === V.length ? (++ee, W.next ? k.head = W.next : k.head = k.tail = null) : (k.head = W, W.data = V.slice(K));
        break;
      }
      ++ee;
    }
    return k.length -= ee, M;
  }
  function X(y) {
    var k = y._readableState;
    if (k.length > 0) throw new Error('"endReadable()" called on non-empty stream');
    k.endEmitted || (k.ended = !0, e.nextTick(Q, k, y));
  }
  function Q(y, k) {
    !y.endEmitted && y.length === 0 && (y.endEmitted = !0, k.readable = !1, k.emit("end"));
  }
  function Y(y, k) {
    for (var M = 0, W = y.length; M < W; M++)
      if (y[M] === k) return M;
    return -1;
  }
  return zi;
}
var Gi, cs;
function Ho() {
  if (cs) return Gi;
  cs = 1, Gi = i;
  var e = Lt(), r = Object.create(cr());
  r.inherits = Pt(), r.inherits(i, e);
  function t(s, f) {
    var c = this._transformState;
    c.transforming = !1;
    var o = c.writecb;
    if (!o)
      return this.emit("error", new Error("write callback called multiple times"));
    c.writechunk = null, c.writecb = null, f != null && this.push(f), o(s);
    var d = this._readableState;
    d.reading = !1, (d.needReadable || d.length < d.highWaterMark) && this._read(d.highWaterMark);
  }
  function i(s) {
    if (!(this instanceof i)) return new i(s);
    e.call(this, s), this._transformState = {
      afterTransform: t.bind(this),
      needTransform: !1,
      transforming: !1,
      writecb: null,
      writechunk: null,
      writeencoding: null
    }, this._readableState.needReadable = !0, this._readableState.sync = !1, s && (typeof s.transform == "function" && (this._transform = s.transform), typeof s.flush == "function" && (this._flush = s.flush)), this.on("prefinish", n);
  }
  function n() {
    var s = this;
    typeof this._flush == "function" ? this._flush(function(f, c) {
      a(s, f, c);
    }) : a(this, null, null);
  }
  i.prototype.push = function(s, f) {
    return this._transformState.needTransform = !1, e.prototype.push.call(this, s, f);
  }, i.prototype._transform = function(s, f, c) {
    throw new Error("_transform() is not implemented");
  }, i.prototype._write = function(s, f, c) {
    var o = this._transformState;
    if (o.writecb = c, o.writechunk = s, o.writeencoding = f, !o.transforming) {
      var d = this._readableState;
      (o.needTransform || d.needReadable || d.length < d.highWaterMark) && this._read(d.highWaterMark);
    }
  }, i.prototype._read = function(s) {
    var f = this._transformState;
    f.writechunk !== null && f.writecb && !f.transforming ? (f.transforming = !0, this._transform(f.writechunk, f.writeencoding, f.afterTransform)) : f.needTransform = !0;
  }, i.prototype._destroy = function(s, f) {
    var c = this;
    e.prototype._destroy.call(this, s, function(o) {
      f(o), c.emit("close");
    });
  };
  function a(s, f, c) {
    if (f) return s.emit("error", f);
    if (c != null && s.push(c), s._writableState.length) throw new Error("Calling transform done when ws.length != 0");
    if (s._transformState.transforming) throw new Error("Calling transform done when still transforming");
    return s.push(null);
  }
  return Gi;
}
var Zi, hs;
function Nh() {
  if (hs) return Zi;
  hs = 1, Zi = t;
  var e = Ho(), r = Object.create(cr());
  r.inherits = Pt(), r.inherits(t, e);
  function t(i) {
    if (!(this instanceof t)) return new t(i);
    e.call(this, i);
  }
  return t.prototype._transform = function(i, n, a) {
    a(null, i);
  }, Zi;
}
var ds;
function Vo() {
  return ds || (ds = 1, function(e, r) {
    var t = Ro;
    process.env.READABLE_STREAM === "disable" && t ? (e.exports = t, r = e.exports = t.Readable, r.Readable = t.Readable, r.Writable = t.Writable, r.Duplex = t.Duplex, r.Transform = t.Transform, r.PassThrough = t.PassThrough, r.Stream = t) : (r = e.exports = qo(), r.Stream = t || r, r.Readable = r, r.Writable = Wo(), r.Duplex = Lt(), r.Transform = Ho(), r.PassThrough = Nh());
  }(Rr, Rr.exports)), Rr.exports;
}
var vs, Ar;
he.base64 = !0;
he.array = !0;
he.string = !0;
he.arraybuffer = typeof ArrayBuffer < "u" && typeof Uint8Array < "u";
he.nodebuffer = typeof Buffer < "u";
he.uint8array = typeof Uint8Array < "u";
if (typeof ArrayBuffer > "u")
  Ar = he.blob = !1;
else {
  var ps = new ArrayBuffer(0);
  try {
    Ar = he.blob = new Blob([ps], {
      type: "application/zip"
    }).size === 0;
  } catch {
    try {
      var Lh = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder, _s = new Lh();
      _s.append(ps), Ar = he.blob = _s.getBlob("application/zip").size === 0;
    } catch {
      Ar = he.blob = !1;
    }
  }
}
try {
  vs = he.nodestream = !!Vo().Readable;
} catch {
  vs = he.nodestream = !1;
}
var $r = {}, gs;
function Xo() {
  if (gs) return $r;
  gs = 1;
  var e = ue(), r = he, t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  return $r.encode = function(i) {
    for (var n = [], a, s, f, c, o, d, m, u = 0, h = i.length, p = h, v = e.getTypeOf(i) !== "string"; u < i.length; )
      p = h - u, v ? (a = i[u++], s = u < h ? i[u++] : 0, f = u < h ? i[u++] : 0) : (a = i.charCodeAt(u++), s = u < h ? i.charCodeAt(u++) : 0, f = u < h ? i.charCodeAt(u++) : 0), c = a >> 2, o = (a & 3) << 4 | s >> 4, d = p > 1 ? (s & 15) << 2 | f >> 6 : 64, m = p > 2 ? f & 63 : 64, n.push(t.charAt(c) + t.charAt(o) + t.charAt(d) + t.charAt(m));
    return n.join("");
  }, $r.decode = function(i) {
    var n, a, s, f, c, o, d, m = 0, u = 0, h = "data:";
    if (i.substr(0, h.length) === h)
      throw new Error("Invalid base64 input, it looks like a data url.");
    i = i.replace(/[^A-Za-z0-9+/=]/g, "");
    var p = i.length * 3 / 4;
    if (i.charAt(i.length - 1) === t.charAt(64) && p--, i.charAt(i.length - 2) === t.charAt(64) && p--, p % 1 !== 0)
      throw new Error("Invalid base64 input, bad content length.");
    var v;
    for (r.uint8array ? v = new Uint8Array(p | 0) : v = new Array(p | 0); m < i.length; )
      f = t.indexOf(i.charAt(m++)), c = t.indexOf(i.charAt(m++)), o = t.indexOf(i.charAt(m++)), d = t.indexOf(i.charAt(m++)), n = f << 2 | c >> 4, a = (c & 15) << 4 | o >> 2, s = (o & 3) << 6 | d, v[u++] = n, o !== 64 && (v[u++] = a), d !== 64 && (v[u++] = s);
    return v;
  }, $r;
}
var oi = {
  /**
   * True if this is running in Nodejs, will be undefined in a browser.
   * In a browser, browserify won't include this file and the whole module
   * will be resolved an empty object.
   */
  isNode: typeof Buffer < "u",
  /**
   * Create a new nodejs Buffer from an existing content.
   * @param {Object} data the data to pass to the constructor.
   * @param {String} encoding the encoding to use.
   * @return {Buffer} a new Buffer.
   */
  newBufferFrom: function(e, r) {
    if (Buffer.from && Buffer.from !== Uint8Array.from)
      return Buffer.from(e, r);
    if (typeof e == "number")
      throw new Error('The "data" argument must not be a number');
    return new Buffer(e, r);
  },
  /**
   * Create a new nodejs Buffer with the specified size.
   * @param {Integer} size the size of the buffer.
   * @return {Buffer} a new Buffer.
   */
  allocBuffer: function(e) {
    if (Buffer.alloc)
      return Buffer.alloc(e);
    var r = new Buffer(e);
    return r.fill(0), r;
  },
  /**
   * Find out if an object is a Buffer.
   * @param {Object} b the object to test.
   * @return {Boolean} true if the object is a Buffer, false otherwise.
   */
  isBuffer: function(e) {
    return Buffer.isBuffer(e);
  },
  isStream: function(e) {
    return e && typeof e.on == "function" && typeof e.pause == "function" && typeof e.resume == "function";
  }
}, Wi, ms;
function Dh() {
  if (ms) return Wi;
  ms = 1;
  var e = ve.MutationObserver || ve.WebKitMutationObserver, r;
  if (process.browser)
    if (e) {
      var t = 0, i = new e(c), n = ve.document.createTextNode("");
      i.observe(n, {
        characterData: !0
      }), r = function() {
        n.data = t = ++t % 2;
      };
    } else if (!ve.setImmediate && typeof ve.MessageChannel < "u") {
      var a = new ve.MessageChannel();
      a.port1.onmessage = c, r = function() {
        a.port2.postMessage(0);
      };
    } else "document" in ve && "onreadystatechange" in ve.document.createElement("script") ? r = function() {
      var d = ve.document.createElement("script");
      d.onreadystatechange = function() {
        c(), d.onreadystatechange = null, d.parentNode.removeChild(d), d = null;
      }, ve.document.documentElement.appendChild(d);
    } : r = function() {
      setTimeout(c, 0);
    };
  else
    r = function() {
      process.nextTick(c);
    };
  var s, f = [];
  function c() {
    s = !0;
    for (var d, m, u = f.length; u; ) {
      for (m = f, f = [], d = -1; ++d < u; )
        m[d]();
      u = f.length;
    }
    s = !1;
  }
  Wi = o;
  function o(d) {
    f.push(d) === 1 && !s && r();
  }
  return Wi;
}
var qi, ys;
function Ph() {
  if (ys) return qi;
  ys = 1;
  var e = Dh();
  function r() {
  }
  var t = {}, i = ["REJECTED"], n = ["FULFILLED"], a = ["PENDING"];
  if (!process.browser)
    var s = ["UNHANDLED"];
  qi = f;
  function f(l) {
    if (typeof l != "function")
      throw new TypeError("resolver must be a function");
    this.state = a, this.queue = [], this.outcome = void 0, process.browser || (this.handled = s), l !== r && m(this, l);
  }
  f.prototype.finally = function(l) {
    if (typeof l != "function")
      return this;
    var _ = this.constructor;
    return this.then(R, g);
    function R(E) {
      function $() {
        return E;
      }
      return _.resolve(l()).then($);
    }
    function g(E) {
      function $() {
        throw E;
      }
      return _.resolve(l()).then($);
    }
  }, f.prototype.catch = function(l) {
    return this.then(null, l);
  }, f.prototype.then = function(l, _) {
    if (typeof l != "function" && this.state === n || typeof _ != "function" && this.state === i)
      return this;
    var R = new this.constructor(r);
    if (process.browser || this.handled === s && (this.handled = null), this.state !== a) {
      var g = this.state === n ? l : _;
      o(R, g, this.outcome);
    } else
      this.queue.push(new c(R, l, _));
    return R;
  };
  function c(l, _, R) {
    this.promise = l, typeof _ == "function" && (this.onFulfilled = _, this.callFulfilled = this.otherCallFulfilled), typeof R == "function" && (this.onRejected = R, this.callRejected = this.otherCallRejected);
  }
  c.prototype.callFulfilled = function(l) {
    t.resolve(this.promise, l);
  }, c.prototype.otherCallFulfilled = function(l) {
    o(this.promise, this.onFulfilled, l);
  }, c.prototype.callRejected = function(l) {
    t.reject(this.promise, l);
  }, c.prototype.otherCallRejected = function(l) {
    o(this.promise, this.onRejected, l);
  };
  function o(l, _, R) {
    e(function() {
      var g;
      try {
        g = _(R);
      } catch (E) {
        return t.reject(l, E);
      }
      g === l ? t.reject(l, new TypeError("Cannot resolve promise with itself")) : t.resolve(l, g);
    });
  }
  t.resolve = function(l, _) {
    var R = u(d, _);
    if (R.status === "error")
      return t.reject(l, R.value);
    var g = R.value;
    if (g)
      m(l, g);
    else {
      l.state = n, l.outcome = _;
      for (var E = -1, $ = l.queue.length; ++E < $; )
        l.queue[E].callFulfilled(_);
    }
    return l;
  }, t.reject = function(l, _) {
    l.state = i, l.outcome = _, process.browser || l.handled === s && e(function() {
      l.handled === s && process.emit("unhandledRejection", _, l);
    });
    for (var R = -1, g = l.queue.length; ++R < g; )
      l.queue[R].callRejected(_);
    return l;
  };
  function d(l) {
    var _ = l && l.then;
    if (l && (typeof l == "object" || typeof l == "function") && typeof _ == "function")
      return function() {
        _.apply(l, arguments);
      };
  }
  function m(l, _) {
    var R = !1;
    function g(T) {
      R || (R = !0, t.reject(l, T));
    }
    function E(T) {
      R || (R = !0, t.resolve(l, T));
    }
    function $() {
      _(E, g);
    }
    var A = u($);
    A.status === "error" && g(A.value);
  }
  function u(l, _) {
    var R = {};
    try {
      R.value = l(_), R.status = "success";
    } catch (g) {
      R.status = "error", R.value = g;
    }
    return R;
  }
  f.resolve = h;
  function h(l) {
    return l instanceof this ? l : t.resolve(new this(r), l);
  }
  f.reject = p;
  function p(l) {
    var _ = new this(r);
    return t.reject(_, l);
  }
  f.all = v;
  function v(l) {
    var _ = this;
    if (Object.prototype.toString.call(l) !== "[object Array]")
      return this.reject(new TypeError("must be an array"));
    var R = l.length, g = !1;
    if (!R)
      return this.resolve([]);
    for (var E = new Array(R), $ = 0, A = -1, T = new this(r); ++A < R; )
      b(l[A], A);
    return T;
    function b(I, O) {
      _.resolve(I).then(L, function(B) {
        g || (g = !0, t.reject(T, B));
      });
      function L(B) {
        E[O] = B, ++$ === R && !g && (g = !0, t.resolve(T, E));
      }
    }
  }
  f.race = x;
  function x(l) {
    var _ = this;
    if (Object.prototype.toString.call(l) !== "[object Array]")
      return this.reject(new TypeError("must be an array"));
    var R = l.length, g = !1;
    if (!R)
      return this.resolve([]);
    for (var E = -1, $ = new this(r); ++E < R; )
      A(l[E]);
    return $;
    function A(T) {
      _.resolve(T).then(function(b) {
        g || (g = !0, t.resolve($, b));
      }, function(b) {
        g || (g = !0, t.reject($, b));
      });
    }
  }
  return qi;
}
var mn = null;
typeof Promise < "u" ? mn = Promise : mn = Ph();
var hr = {
  Promise: mn
};
(function(e, r) {
  if (e.setImmediate)
    return;
  var t = 1, i = {}, n = !1, a = e.document, s;
  function f(_) {
    typeof _ != "function" && (_ = new Function("" + _));
    for (var R = new Array(arguments.length - 1), g = 0; g < R.length; g++)
      R[g] = arguments[g + 1];
    var E = { callback: _, args: R };
    return i[t] = E, s(t), t++;
  }
  function c(_) {
    delete i[_];
  }
  function o(_) {
    var R = _.callback, g = _.args;
    switch (g.length) {
      case 0:
        R();
        break;
      case 1:
        R(g[0]);
        break;
      case 2:
        R(g[0], g[1]);
        break;
      case 3:
        R(g[0], g[1], g[2]);
        break;
      default:
        R.apply(r, g);
        break;
    }
  }
  function d(_) {
    if (n)
      setTimeout(d, 0, _);
    else {
      var R = i[_];
      if (R) {
        n = !0;
        try {
          o(R);
        } finally {
          c(_), n = !1;
        }
      }
    }
  }
  function m() {
    s = function(_) {
      process.nextTick(function() {
        d(_);
      });
    };
  }
  function u() {
    if (e.postMessage && !e.importScripts) {
      var _ = !0, R = e.onmessage;
      return e.onmessage = function() {
        _ = !1;
      }, e.postMessage("", "*"), e.onmessage = R, _;
    }
  }
  function h() {
    var _ = "setImmediate$" + Math.random() + "$", R = function(g) {
      g.source === e && typeof g.data == "string" && g.data.indexOf(_) === 0 && d(+g.data.slice(_.length));
    };
    e.addEventListener ? e.addEventListener("message", R, !1) : e.attachEvent("onmessage", R), s = function(g) {
      e.postMessage(_ + g, "*");
    };
  }
  function p() {
    var _ = new MessageChannel();
    _.port1.onmessage = function(R) {
      var g = R.data;
      d(g);
    }, s = function(R) {
      _.port2.postMessage(R);
    };
  }
  function v() {
    var _ = a.documentElement;
    s = function(R) {
      var g = a.createElement("script");
      g.onreadystatechange = function() {
        d(R), g.onreadystatechange = null, _.removeChild(g), g = null;
      }, _.appendChild(g);
    };
  }
  function x() {
    s = function(_) {
      setTimeout(d, 0, _);
    };
  }
  var l = Object.getPrototypeOf && Object.getPrototypeOf(e);
  l = l && l.setTimeout ? l : e, {}.toString.call(e.process) === "[object process]" ? m() : u() ? h() : e.MessageChannel ? p() : a && "onreadystatechange" in a.createElement("script") ? v() : x(), l.setImmediate = f, l.clearImmediate = c;
})(typeof self > "u" ? ve : self);
var ws;
function ue() {
  return ws || (ws = 1, function(e) {
    var r = he, t = Xo(), i = oi, n = hr;
    function a(u) {
      var h = null;
      return r.uint8array ? h = new Uint8Array(u.length) : h = new Array(u.length), f(u, h);
    }
    e.newBlob = function(u, h) {
      e.checkSupport("blob");
      try {
        return new Blob([u], {
          type: h
        });
      } catch {
        try {
          var p = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder, v = new p();
          return v.append(u), v.getBlob(h);
        } catch {
          throw new Error("Bug : can't construct the Blob.");
        }
      }
    };
    function s(u) {
      return u;
    }
    function f(u, h) {
      for (var p = 0; p < u.length; ++p)
        h[p] = u.charCodeAt(p) & 255;
      return h;
    }
    var c = {
      /**
       * Transform an array of int into a string, chunk by chunk.
       * See the performances notes on arrayLikeToString.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @param {String} type the type of the array.
       * @param {Integer} chunk the chunk size.
       * @return {String} the resulting string.
       * @throws Error if the chunk is too big for the stack.
       */
      stringifyByChunk: function(u, h, p) {
        var v = [], x = 0, l = u.length;
        if (l <= p)
          return String.fromCharCode.apply(null, u);
        for (; x < l; )
          h === "array" || h === "nodebuffer" ? v.push(String.fromCharCode.apply(null, u.slice(x, Math.min(x + p, l)))) : v.push(String.fromCharCode.apply(null, u.subarray(x, Math.min(x + p, l)))), x += p;
        return v.join("");
      },
      /**
       * Call String.fromCharCode on every item in the array.
       * This is the naive implementation, which generate A LOT of intermediate string.
       * This should be used when everything else fail.
       * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
       * @return {String} the result.
       */
      stringifyByChar: function(u) {
        for (var h = "", p = 0; p < u.length; p++)
          h += String.fromCharCode(u[p]);
        return h;
      },
      applyCanBeUsed: {
        /**
         * true if the browser accepts to use String.fromCharCode on Uint8Array
         */
        uint8array: function() {
          try {
            return r.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
          } catch {
            return !1;
          }
        }(),
        /**
         * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
         */
        nodebuffer: function() {
          try {
            return r.nodebuffer && String.fromCharCode.apply(null, i.allocBuffer(1)).length === 1;
          } catch {
            return !1;
          }
        }()
      }
    };
    function o(u) {
      var h = 65536, p = e.getTypeOf(u), v = !0;
      if (p === "uint8array" ? v = c.applyCanBeUsed.uint8array : p === "nodebuffer" && (v = c.applyCanBeUsed.nodebuffer), v)
        for (; h > 1; )
          try {
            return c.stringifyByChunk(u, p, h);
          } catch {
            h = Math.floor(h / 2);
          }
      return c.stringifyByChar(u);
    }
    e.applyFromCharCode = o;
    function d(u, h) {
      for (var p = 0; p < u.length; p++)
        h[p] = u[p];
      return h;
    }
    var m = {};
    m.string = {
      string: s,
      array: function(u) {
        return f(u, new Array(u.length));
      },
      arraybuffer: function(u) {
        return m.string.uint8array(u).buffer;
      },
      uint8array: function(u) {
        return f(u, new Uint8Array(u.length));
      },
      nodebuffer: function(u) {
        return f(u, i.allocBuffer(u.length));
      }
    }, m.array = {
      string: o,
      array: s,
      arraybuffer: function(u) {
        return new Uint8Array(u).buffer;
      },
      uint8array: function(u) {
        return new Uint8Array(u);
      },
      nodebuffer: function(u) {
        return i.newBufferFrom(u);
      }
    }, m.arraybuffer = {
      string: function(u) {
        return o(new Uint8Array(u));
      },
      array: function(u) {
        return d(new Uint8Array(u), new Array(u.byteLength));
      },
      arraybuffer: s,
      uint8array: function(u) {
        return new Uint8Array(u);
      },
      nodebuffer: function(u) {
        return i.newBufferFrom(new Uint8Array(u));
      }
    }, m.uint8array = {
      string: o,
      array: function(u) {
        return d(u, new Array(u.length));
      },
      arraybuffer: function(u) {
        return u.buffer;
      },
      uint8array: s,
      nodebuffer: function(u) {
        return i.newBufferFrom(u);
      }
    }, m.nodebuffer = {
      string: o,
      array: function(u) {
        return d(u, new Array(u.length));
      },
      arraybuffer: function(u) {
        return m.nodebuffer.uint8array(u).buffer;
      },
      uint8array: function(u) {
        return d(u, new Uint8Array(u.length));
      },
      nodebuffer: s
    }, e.transformTo = function(u, h) {
      if (h || (h = ""), !u)
        return h;
      e.checkSupport(u);
      var p = e.getTypeOf(h), v = m[p][u](h);
      return v;
    }, e.resolve = function(u) {
      for (var h = u.split("/"), p = [], v = 0; v < h.length; v++) {
        var x = h[v];
        x === "." || x === "" && v !== 0 && v !== h.length - 1 || (x === ".." ? p.pop() : p.push(x));
      }
      return p.join("/");
    }, e.getTypeOf = function(u) {
      if (typeof u == "string")
        return "string";
      if (Object.prototype.toString.call(u) === "[object Array]")
        return "array";
      if (r.nodebuffer && i.isBuffer(u))
        return "nodebuffer";
      if (r.uint8array && u instanceof Uint8Array)
        return "uint8array";
      if (r.arraybuffer && u instanceof ArrayBuffer)
        return "arraybuffer";
    }, e.checkSupport = function(u) {
      var h = r[u.toLowerCase()];
      if (!h)
        throw new Error(u + " is not supported by this platform");
    }, e.MAX_VALUE_16BITS = 65535, e.MAX_VALUE_32BITS = -1, e.pretty = function(u) {
      var h = "", p, v;
      for (v = 0; v < (u || "").length; v++)
        p = u.charCodeAt(v), h += "\\x" + (p < 16 ? "0" : "") + p.toString(16).toUpperCase();
      return h;
    }, e.delay = function(u, h, p) {
      setImmediate(function() {
        u.apply(p || null, h || []);
      });
    }, e.inherits = function(u, h) {
      var p = function() {
      };
      p.prototype = h.prototype, u.prototype = new p();
    }, e.extend = function() {
      var u = {}, h, p;
      for (h = 0; h < arguments.length; h++)
        for (p in arguments[h])
          Object.prototype.hasOwnProperty.call(arguments[h], p) && typeof u[p] > "u" && (u[p] = arguments[h][p]);
      return u;
    }, e.prepareContent = function(u, h, p, v, x) {
      var l = n.Promise.resolve(h).then(function(_) {
        var R = r.blob && (_ instanceof Blob || ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(_)) !== -1);
        return R && typeof FileReader < "u" ? new n.Promise(function(g, E) {
          var $ = new FileReader();
          $.onload = function(A) {
            g(A.target.result);
          }, $.onerror = function(A) {
            E(A.target.error);
          }, $.readAsArrayBuffer(_);
        }) : _;
      });
      return l.then(function(_) {
        var R = e.getTypeOf(_);
        return R ? (R === "arraybuffer" ? _ = e.transformTo("uint8array", _) : R === "string" && (x ? _ = t.decode(_) : p && v !== !0 && (_ = a(_))), _) : n.Promise.reject(
          new Error("Can't read the data of '" + u + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?")
        );
      });
    };
  }(Ni)), Ni;
}
function Yo(e) {
  this.name = e || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = {
    data: [],
    end: [],
    error: []
  }, this.previous = null;
}
Yo.prototype = {
  /**
   * Push a chunk to the next workers.
   * @param {Object} chunk the chunk to push
   */
  push: function(e) {
    this.emit("data", e);
  },
  /**
   * End the stream.
   * @return {Boolean} true if this call ended the worker, false otherwise.
   */
  end: function() {
    if (this.isFinished)
      return !1;
    this.flush();
    try {
      this.emit("end"), this.cleanUp(), this.isFinished = !0;
    } catch (e) {
      this.emit("error", e);
    }
    return !0;
  },
  /**
   * End the stream with an error.
   * @param {Error} e the error which caused the premature end.
   * @return {Boolean} true if this call ended the worker with an error, false otherwise.
   */
  error: function(e) {
    return this.isFinished ? !1 : (this.isPaused ? this.generatedError = e : (this.isFinished = !0, this.emit("error", e), this.previous && this.previous.error(e), this.cleanUp()), !0);
  },
  /**
   * Add a callback on an event.
   * @param {String} name the name of the event (data, end, error)
   * @param {Function} listener the function to call when the event is triggered
   * @return {GenericWorker} the current object for chainability
   */
  on: function(e, r) {
    return this._listeners[e].push(r), this;
  },
  /**
   * Clean any references when a worker is ending.
   */
  cleanUp: function() {
    this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
  },
  /**
   * Trigger an event. This will call registered callback with the provided arg.
   * @param {String} name the name of the event (data, end, error)
   * @param {Object} arg the argument to call the callback with.
   */
  emit: function(e, r) {
    if (this._listeners[e])
      for (var t = 0; t < this._listeners[e].length; t++)
        this._listeners[e][t].call(this, r);
  },
  /**
   * Chain a worker with an other.
   * @param {Worker} next the worker receiving events from the current one.
   * @return {worker} the next worker for chainability
   */
  pipe: function(e) {
    return e.registerPrevious(this);
  },
  /**
   * Same as `pipe` in the other direction.
   * Using an API with `pipe(next)` is very easy.
   * Implementing the API with the point of view of the next one registering
   * a source is easier, see the ZipFileWorker.
   * @param {Worker} previous the previous worker, sending events to this one
   * @return {Worker} the current worker for chainability
   */
  registerPrevious: function(e) {
    if (this.isLocked)
      throw new Error("The stream '" + this + "' has already been used.");
    this.streamInfo = e.streamInfo, this.mergeStreamInfo(), this.previous = e;
    var r = this;
    return e.on("data", function(t) {
      r.processChunk(t);
    }), e.on("end", function() {
      r.end();
    }), e.on("error", function(t) {
      r.error(t);
    }), this;
  },
  /**
   * Pause the stream so it doesn't send events anymore.
   * @return {Boolean} true if this call paused the worker, false otherwise.
   */
  pause: function() {
    return this.isPaused || this.isFinished ? !1 : (this.isPaused = !0, this.previous && this.previous.pause(), !0);
  },
  /**
   * Resume a paused stream.
   * @return {Boolean} true if this call resumed the worker, false otherwise.
   */
  resume: function() {
    if (!this.isPaused || this.isFinished)
      return !1;
    this.isPaused = !1;
    var e = !1;
    return this.generatedError && (this.error(this.generatedError), e = !0), this.previous && this.previous.resume(), !e;
  },
  /**
   * Flush any remaining bytes as the stream is ending.
   */
  flush: function() {
  },
  /**
   * Process a chunk. This is usually the method overridden.
   * @param {Object} chunk the chunk to process.
   */
  processChunk: function(e) {
    this.push(e);
  },
  /**
   * Add a key/value to be added in the workers chain streamInfo once activated.
   * @param {String} key the key to use
   * @param {Object} value the associated value
   * @return {Worker} the current worker for chainability
   */
  withStreamInfo: function(e, r) {
    return this.extraStreamInfo[e] = r, this.mergeStreamInfo(), this;
  },
  /**
   * Merge this worker's streamInfo into the chain's streamInfo.
   */
  mergeStreamInfo: function() {
    for (var e in this.extraStreamInfo)
      Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e) && (this.streamInfo[e] = this.extraStreamInfo[e]);
  },
  /**
   * Lock the stream to prevent further updates on the workers chain.
   * After calling this method, all calls to pipe will fail.
   */
  lock: function() {
    if (this.isLocked)
      throw new Error("The stream '" + this + "' has already been used.");
    this.isLocked = !0, this.previous && this.previous.lock();
  },
  /**
   *
   * Pretty print the workers chain.
   */
  toString: function() {
    var e = "Worker " + this.name;
    return this.previous ? this.previous + " -> " + e : e;
  }
};
var Te = Yo;
(function(e) {
  for (var r = ue(), t = he, i = oi, n = Te, a = new Array(256), s = 0; s < 256; s++)
    a[s] = s >= 252 ? 6 : s >= 248 ? 5 : s >= 240 ? 4 : s >= 224 ? 3 : s >= 192 ? 2 : 1;
  a[254] = a[254] = 1;
  var f = function(u) {
    var h, p, v, x, l, _ = u.length, R = 0;
    for (x = 0; x < _; x++)
      p = u.charCodeAt(x), (p & 64512) === 55296 && x + 1 < _ && (v = u.charCodeAt(x + 1), (v & 64512) === 56320 && (p = 65536 + (p - 55296 << 10) + (v - 56320), x++)), R += p < 128 ? 1 : p < 2048 ? 2 : p < 65536 ? 3 : 4;
    for (t.uint8array ? h = new Uint8Array(R) : h = new Array(R), l = 0, x = 0; l < R; x++)
      p = u.charCodeAt(x), (p & 64512) === 55296 && x + 1 < _ && (v = u.charCodeAt(x + 1), (v & 64512) === 56320 && (p = 65536 + (p - 55296 << 10) + (v - 56320), x++)), p < 128 ? h[l++] = p : p < 2048 ? (h[l++] = 192 | p >>> 6, h[l++] = 128 | p & 63) : p < 65536 ? (h[l++] = 224 | p >>> 12, h[l++] = 128 | p >>> 6 & 63, h[l++] = 128 | p & 63) : (h[l++] = 240 | p >>> 18, h[l++] = 128 | p >>> 12 & 63, h[l++] = 128 | p >>> 6 & 63, h[l++] = 128 | p & 63);
    return h;
  }, c = function(u, h) {
    var p;
    for (h = h || u.length, h > u.length && (h = u.length), p = h - 1; p >= 0 && (u[p] & 192) === 128; )
      p--;
    return p < 0 || p === 0 ? h : p + a[u[p]] > h ? p : h;
  }, o = function(u) {
    var h, p, v, x, l = u.length, _ = new Array(l * 2);
    for (p = 0, h = 0; h < l; ) {
      if (v = u[h++], v < 128) {
        _[p++] = v;
        continue;
      }
      if (x = a[v], x > 4) {
        _[p++] = 65533, h += x - 1;
        continue;
      }
      for (v &= x === 2 ? 31 : x === 3 ? 15 : 7; x > 1 && h < l; )
        v = v << 6 | u[h++] & 63, x--;
      if (x > 1) {
        _[p++] = 65533;
        continue;
      }
      v < 65536 ? _[p++] = v : (v -= 65536, _[p++] = 55296 | v >> 10 & 1023, _[p++] = 56320 | v & 1023);
    }
    return _.length !== p && (_.subarray ? _ = _.subarray(0, p) : _.length = p), r.applyFromCharCode(_);
  };
  e.utf8encode = function(h) {
    return t.nodebuffer ? i.newBufferFrom(h, "utf-8") : f(h);
  }, e.utf8decode = function(h) {
    return t.nodebuffer ? r.transformTo("nodebuffer", h).toString("utf-8") : (h = r.transformTo(t.uint8array ? "uint8array" : "array", h), o(h));
  };
  function d() {
    n.call(this, "utf-8 decode"), this.leftOver = null;
  }
  r.inherits(d, n), d.prototype.processChunk = function(u) {
    var h = r.transformTo(t.uint8array ? "uint8array" : "array", u.data);
    if (this.leftOver && this.leftOver.length) {
      if (t.uint8array) {
        var p = h;
        h = new Uint8Array(p.length + this.leftOver.length), h.set(this.leftOver, 0), h.set(p, this.leftOver.length);
      } else
        h = this.leftOver.concat(h);
      this.leftOver = null;
    }
    var v = c(h), x = h;
    v !== h.length && (t.uint8array ? (x = h.subarray(0, v), this.leftOver = h.subarray(v, h.length)) : (x = h.slice(0, v), this.leftOver = h.slice(v, h.length))), this.push({
      data: e.utf8decode(x),
      meta: u.meta
    });
  }, d.prototype.flush = function() {
    this.leftOver && this.leftOver.length && (this.push({
      data: e.utf8decode(this.leftOver),
      meta: {}
    }), this.leftOver = null);
  }, e.Utf8DecodeWorker = d;
  function m() {
    n.call(this, "utf-8 encode");
  }
  r.inherits(m, n), m.prototype.processChunk = function(u) {
    this.push({
      data: e.utf8encode(u.data),
      meta: u.meta
    });
  }, e.Utf8EncodeWorker = m;
})(jt);
var Ko = Te, Jo = ue();
function Wn(e) {
  Ko.call(this, "ConvertWorker to " + e), this.destType = e;
}
Jo.inherits(Wn, Ko);
Wn.prototype.processChunk = function(e) {
  this.push({
    data: Jo.transformTo(this.destType, e.data),
    meta: e.meta
  });
};
var jh = Wn, Hi, Es;
function Fh() {
  if (Es) return Hi;
  Es = 1;
  var e = Vo().Readable, r = ue();
  r.inherits(t, e);
  function t(i, n, a) {
    e.call(this, n), this._helper = i;
    var s = this;
    i.on("data", function(f, c) {
      s.push(f) || s._helper.pause(), a && a(c);
    }).on("error", function(f) {
      s.emit("error", f);
    }).on("end", function() {
      s.push(null);
    });
  }
  return t.prototype._read = function() {
    this._helper.resume();
  }, Hi = t, Hi;
}
var dt = ue(), Bh = jh, Mh = Te, Uh = Xo(), zh = he, Gh = hr, Qo = null;
if (zh.nodestream)
  try {
    Qo = Fh();
  } catch {
  }
function Zh(e, r, t) {
  switch (e) {
    case "blob":
      return dt.newBlob(dt.transformTo("arraybuffer", r), t);
    case "base64":
      return Uh.encode(r);
    default:
      return dt.transformTo(e, r);
  }
}
function Wh(e, r) {
  var t, i = 0, n = null, a = 0;
  for (t = 0; t < r.length; t++)
    a += r[t].length;
  switch (e) {
    case "string":
      return r.join("");
    case "array":
      return Array.prototype.concat.apply([], r);
    case "uint8array":
      for (n = new Uint8Array(a), t = 0; t < r.length; t++)
        n.set(r[t], i), i += r[t].length;
      return n;
    case "nodebuffer":
      return Buffer.concat(r);
    default:
      throw new Error("concat : unsupported type '" + e + "'");
  }
}
function qh(e, r) {
  return new Gh.Promise(function(t, i) {
    var n = [], a = e._internalType, s = e._outputType, f = e._mimeType;
    e.on("data", function(c, o) {
      n.push(c), r && r(o);
    }).on("error", function(c) {
      n = [], i(c);
    }).on("end", function() {
      try {
        var c = Zh(s, Wh(a, n), f);
        t(c);
      } catch (o) {
        i(o);
      }
      n = [];
    }).resume();
  });
}
function ef(e, r, t) {
  var i = r;
  switch (r) {
    case "blob":
    case "arraybuffer":
      i = "uint8array";
      break;
    case "base64":
      i = "string";
      break;
  }
  try {
    this._internalType = i, this._outputType = r, this._mimeType = t, dt.checkSupport(i), this._worker = e.pipe(new Bh(i)), e.lock();
  } catch (n) {
    this._worker = new Mh("error"), this._worker.error(n);
  }
}
ef.prototype = {
  /**
   * Listen a StreamHelper, accumulate its content and concatenate it into a
   * complete block.
   * @param {Function} updateCb the update callback.
   * @return Promise the promise for the accumulation.
   */
  accumulate: function(e) {
    return qh(this, e);
  },
  /**
   * Add a listener on an event triggered on a stream.
   * @param {String} evt the name of the event
   * @param {Function} fn the listener
   * @return {StreamHelper} the current helper.
   */
  on: function(e, r) {
    var t = this;
    return e === "data" ? this._worker.on(e, function(i) {
      r.call(t, i.data, i.meta);
    }) : this._worker.on(e, function() {
      dt.delay(r, arguments, t);
    }), this;
  },
  /**
   * Resume the flow of chunks.
   * @return {StreamHelper} the current helper.
   */
  resume: function() {
    return dt.delay(this._worker.resume, [], this._worker), this;
  },
  /**
   * Pause the flow of chunks.
   * @return {StreamHelper} the current helper.
   */
  pause: function() {
    return this._worker.pause(), this;
  },
  /**
   * Return a nodejs stream for this helper.
   * @param {Function} updateCb the update callback.
   * @return {NodejsStreamOutputAdapter} the nodejs stream.
   */
  toNodejsStream: function(e) {
    if (dt.checkSupport("nodestream"), this._outputType !== "nodebuffer")
      throw new Error(this._outputType + " is not supported by this method");
    return new Qo(this, {
      objectMode: this._outputType !== "nodebuffer"
    }, e);
  }
};
var tf = ef, Ae = {};
Ae.base64 = !1;
Ae.binary = !1;
Ae.dir = !1;
Ae.createFolders = !0;
Ae.date = null;
Ae.compression = null;
Ae.compressionOptions = null;
Ae.comment = null;
Ae.unixPermissions = null;
Ae.dosPermissions = null;
var fi = ue(), li = Te, Hh = 16 * 1024;
function Ft(e) {
  li.call(this, "DataWorker");
  var r = this;
  this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, e.then(function(t) {
    r.dataIsReady = !0, r.data = t, r.max = t && t.length || 0, r.type = fi.getTypeOf(t), r.isPaused || r._tickAndRepeat();
  }, function(t) {
    r.error(t);
  });
}
fi.inherits(Ft, li);
Ft.prototype.cleanUp = function() {
  li.prototype.cleanUp.call(this), this.data = null;
};
Ft.prototype.resume = function() {
  return li.prototype.resume.call(this) ? (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, fi.delay(this._tickAndRepeat, [], this)), !0) : !1;
};
Ft.prototype._tickAndRepeat = function() {
  this._tickScheduled = !1, !(this.isPaused || this.isFinished) && (this._tick(), this.isFinished || (fi.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0));
};
Ft.prototype._tick = function() {
  if (this.isPaused || this.isFinished)
    return !1;
  var e = Hh, r = null, t = Math.min(this.max, this.index + e);
  if (this.index >= this.max)
    return this.end();
  switch (this.type) {
    case "string":
      r = this.data.substring(this.index, t);
      break;
    case "uint8array":
      r = this.data.subarray(this.index, t);
      break;
    case "array":
    case "nodebuffer":
      r = this.data.slice(this.index, t);
      break;
  }
  return this.index = t, this.push({
    data: r,
    meta: {
      percent: this.max ? this.index / this.max * 100 : 0
    }
  });
};
var rf = Ft, Vh = ue();
function Xh() {
  for (var e, r = [], t = 0; t < 256; t++) {
    e = t;
    for (var i = 0; i < 8; i++)
      e = e & 1 ? 3988292384 ^ e >>> 1 : e >>> 1;
    r[t] = e;
  }
  return r;
}
var nf = Xh();
function Yh(e, r, t, i) {
  var n = nf, a = i + t;
  e = e ^ -1;
  for (var s = i; s < a; s++)
    e = e >>> 8 ^ n[(e ^ r[s]) & 255];
  return e ^ -1;
}
function Kh(e, r, t, i) {
  var n = nf, a = i + t;
  e = e ^ -1;
  for (var s = i; s < a; s++)
    e = e >>> 8 ^ n[(e ^ r.charCodeAt(s)) & 255];
  return e ^ -1;
}
var qn = function(r, t) {
  if (typeof r > "u" || !r.length)
    return 0;
  var i = Vh.getTypeOf(r) !== "string";
  return i ? Yh(t | 0, r, r.length, 0) : Kh(t | 0, r, r.length, 0);
}, af = Te, Jh = qn, Qh = ue();
function Hn() {
  af.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
}
Qh.inherits(Hn, af);
Hn.prototype.processChunk = function(e) {
  this.streamInfo.crc32 = Jh(e.data, this.streamInfo.crc32 || 0), this.push(e);
};
var sf = Hn, ed = ue(), Vn = Te;
function Xn(e) {
  Vn.call(this, "DataLengthProbe for " + e), this.propName = e, this.withStreamInfo(e, 0);
}
ed.inherits(Xn, Vn);
Xn.prototype.processChunk = function(e) {
  if (e) {
    var r = this.streamInfo[this.propName] || 0;
    this.streamInfo[this.propName] = r + e.data.length;
  }
  Vn.prototype.processChunk.call(this, e);
};
var td = Xn, bs = hr, Ss = rf, rd = sf, yn = td;
function Yn(e, r, t, i, n) {
  this.compressedSize = e, this.uncompressedSize = r, this.crc32 = t, this.compression = i, this.compressedContent = n;
}
Yn.prototype = {
  /**
   * Create a worker to get the uncompressed content.
   * @return {GenericWorker} the worker.
   */
  getContentWorker: function() {
    var e = new Ss(bs.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new yn("data_length")), r = this;
    return e.on("end", function() {
      if (this.streamInfo.data_length !== r.uncompressedSize)
        throw new Error("Bug : uncompressed data size mismatch");
    }), e;
  },
  /**
   * Create a worker to get the compressed content.
   * @return {GenericWorker} the worker.
   */
  getCompressedWorker: function() {
    return new Ss(bs.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
  }
};
Yn.createWorkerFrom = function(e, r, t) {
  return e.pipe(new rd()).pipe(new yn("uncompressedSize")).pipe(r.compressWorker(t)).pipe(new yn("compressedSize")).withStreamInfo("compression", r);
};
var Kn = Yn, id = tf, nd = rf, Vi = jt, Xi = Kn, ks = Te, Jn = function(e, r, t) {
  this.name = e, this.dir = t.dir, this.date = t.date, this.comment = t.comment, this.unixPermissions = t.unixPermissions, this.dosPermissions = t.dosPermissions, this._data = r, this._dataBinary = t.binary, this.options = {
    compression: t.compression,
    compressionOptions: t.compressionOptions
  };
};
Jn.prototype = {
  /**
   * Create an internal stream for the content of this object.
   * @param {String} type the type of each chunk.
   * @return StreamHelper the stream.
   */
  internalStream: function(e) {
    var r = null, t = "string";
    try {
      if (!e)
        throw new Error("No output type specified.");
      t = e.toLowerCase();
      var i = t === "string" || t === "text";
      (t === "binarystring" || t === "text") && (t = "string"), r = this._decompressWorker();
      var n = !this._dataBinary;
      n && !i && (r = r.pipe(new Vi.Utf8EncodeWorker())), !n && i && (r = r.pipe(new Vi.Utf8DecodeWorker()));
    } catch (a) {
      r = new ks("error"), r.error(a);
    }
    return new id(r, t, "");
  },
  /**
   * Prepare the content in the asked type.
   * @param {String} type the type of the result.
   * @param {Function} onUpdate a function to call on each internal update.
   * @return Promise the promise of the result.
   */
  async: function(e, r) {
    return this.internalStream(e).accumulate(r);
  },
  /**
   * Prepare the content as a nodejs stream.
   * @param {String} type the type of each chunk.
   * @param {Function} onUpdate a function to call on each internal update.
   * @return Stream the stream.
   */
  nodeStream: function(e, r) {
    return this.internalStream(e || "nodebuffer").toNodejsStream(r);
  },
  /**
   * Return a worker for the compressed content.
   * @private
   * @param {Object} compression the compression object to use.
   * @param {Object} compressionOptions the options to use when compressing.
   * @return Worker the worker.
   */
  _compressWorker: function(e, r) {
    if (this._data instanceof Xi && this._data.compression.magic === e.magic)
      return this._data.getCompressedWorker();
    var t = this._decompressWorker();
    return this._dataBinary || (t = t.pipe(new Vi.Utf8EncodeWorker())), Xi.createWorkerFrom(t, e, r);
  },
  /**
   * Return a worker for the decompressed content.
   * @private
   * @return Worker the worker.
   */
  _decompressWorker: function() {
    return this._data instanceof Xi ? this._data.getContentWorker() : this._data instanceof ks ? this._data : new nd(this._data);
  }
};
var xs = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], ad = function() {
  throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
};
for (var Yi = 0; Yi < xs.length; Yi++)
  Jn.prototype[xs[Yi]] = ad;
var sd = Jn, of = {}, ui = {}, ci = {}, Qe = {};
(function(e) {
  var r = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
  function t(a, s) {
    return Object.prototype.hasOwnProperty.call(a, s);
  }
  e.assign = function(a) {
    for (var s = Array.prototype.slice.call(arguments, 1); s.length; ) {
      var f = s.shift();
      if (f) {
        if (typeof f != "object")
          throw new TypeError(f + "must be non-object");
        for (var c in f)
          t(f, c) && (a[c] = f[c]);
      }
    }
    return a;
  }, e.shrinkBuf = function(a, s) {
    return a.length === s ? a : a.subarray ? a.subarray(0, s) : (a.length = s, a);
  };
  var i = {
    arraySet: function(a, s, f, c, o) {
      if (s.subarray && a.subarray) {
        a.set(s.subarray(f, f + c), o);
        return;
      }
      for (var d = 0; d < c; d++)
        a[o + d] = s[f + d];
    },
    // Join array of chunks to single array.
    flattenChunks: function(a) {
      var s, f, c, o, d, m;
      for (c = 0, s = 0, f = a.length; s < f; s++)
        c += a[s].length;
      for (m = new Uint8Array(c), o = 0, s = 0, f = a.length; s < f; s++)
        d = a[s], m.set(d, o), o += d.length;
      return m;
    }
  }, n = {
    arraySet: function(a, s, f, c, o) {
      for (var d = 0; d < c; d++)
        a[o + d] = s[f + d];
    },
    // Join array of chunks to single array.
    flattenChunks: function(a) {
      return [].concat.apply([], a);
    }
  };
  e.setTyped = function(a) {
    a ? (e.Buf8 = Uint8Array, e.Buf16 = Uint16Array, e.Buf32 = Int32Array, e.assign(e, i)) : (e.Buf8 = Array, e.Buf16 = Array, e.Buf32 = Array, e.assign(e, n));
  }, e.setTyped(r);
})(Qe);
var dr = {}, Ge = {}, Bt = {}, od = Qe, fd = 4, Rs = 0, Os = 1, ld = 2;
function Mt(e) {
  for (var r = e.length; --r >= 0; )
    e[r] = 0;
}
var ud = 0, ff = 1, cd = 2, hd = 3, dd = 258, Qn = 29, vr = 256, ar = vr + 1 + Qn, At = 30, ea = 19, lf = 2 * ar + 1, ct = 15, Ki = 16, vd = 7, ta = 256, uf = 16, cf = 17, hf = 18, wn = (
  /* extra bits for each length code */
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
), Ur = (
  /* extra bits for each distance code */
  [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
), pd = (
  /* extra bits for each bit length code */
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
), df = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], _d = 512, Ke = new Array((ar + 2) * 2);
Mt(Ke);
var Yt = new Array(At * 2);
Mt(Yt);
var sr = new Array(_d);
Mt(sr);
var or = new Array(dd - hd + 1);
Mt(or);
var ra = new Array(Qn);
Mt(ra);
var Xr = new Array(At);
Mt(Xr);
function Ji(e, r, t, i, n) {
  this.static_tree = e, this.extra_bits = r, this.extra_base = t, this.elems = i, this.max_length = n, this.has_stree = e && e.length;
}
var vf, pf, _f;
function Qi(e, r) {
  this.dyn_tree = e, this.max_code = 0, this.stat_desc = r;
}
function gf(e) {
  return e < 256 ? sr[e] : sr[256 + (e >>> 7)];
}
function fr(e, r) {
  e.pending_buf[e.pending++] = r & 255, e.pending_buf[e.pending++] = r >>> 8 & 255;
}
function we(e, r, t) {
  e.bi_valid > Ki - t ? (e.bi_buf |= r << e.bi_valid & 65535, fr(e, e.bi_buf), e.bi_buf = r >> Ki - e.bi_valid, e.bi_valid += t - Ki) : (e.bi_buf |= r << e.bi_valid & 65535, e.bi_valid += t);
}
function Ue(e, r, t) {
  we(
    e,
    t[r * 2],
    t[r * 2 + 1]
    /*.Len*/
  );
}
function mf(e, r) {
  var t = 0;
  do
    t |= e & 1, e >>>= 1, t <<= 1;
  while (--r > 0);
  return t >>> 1;
}
function gd(e) {
  e.bi_valid === 16 ? (fr(e, e.bi_buf), e.bi_buf = 0, e.bi_valid = 0) : e.bi_valid >= 8 && (e.pending_buf[e.pending++] = e.bi_buf & 255, e.bi_buf >>= 8, e.bi_valid -= 8);
}
function md(e, r) {
  var t = r.dyn_tree, i = r.max_code, n = r.stat_desc.static_tree, a = r.stat_desc.has_stree, s = r.stat_desc.extra_bits, f = r.stat_desc.extra_base, c = r.stat_desc.max_length, o, d, m, u, h, p, v = 0;
  for (u = 0; u <= ct; u++)
    e.bl_count[u] = 0;
  for (t[e.heap[e.heap_max] * 2 + 1] = 0, o = e.heap_max + 1; o < lf; o++)
    d = e.heap[o], u = t[t[d * 2 + 1] * 2 + 1] + 1, u > c && (u = c, v++), t[d * 2 + 1] = u, !(d > i) && (e.bl_count[u]++, h = 0, d >= f && (h = s[d - f]), p = t[d * 2], e.opt_len += p * (u + h), a && (e.static_len += p * (n[d * 2 + 1] + h)));
  if (v !== 0) {
    do {
      for (u = c - 1; e.bl_count[u] === 0; )
        u--;
      e.bl_count[u]--, e.bl_count[u + 1] += 2, e.bl_count[c]--, v -= 2;
    } while (v > 0);
    for (u = c; u !== 0; u--)
      for (d = e.bl_count[u]; d !== 0; )
        m = e.heap[--o], !(m > i) && (t[m * 2 + 1] !== u && (e.opt_len += (u - t[m * 2 + 1]) * t[m * 2], t[m * 2 + 1] = u), d--);
  }
}
function yf(e, r, t) {
  var i = new Array(ct + 1), n = 0, a, s;
  for (a = 1; a <= ct; a++)
    i[a] = n = n + t[a - 1] << 1;
  for (s = 0; s <= r; s++) {
    var f = e[s * 2 + 1];
    f !== 0 && (e[s * 2] = mf(i[f]++, f));
  }
}
function yd() {
  var e, r, t, i, n, a = new Array(ct + 1);
  for (t = 0, i = 0; i < Qn - 1; i++)
    for (ra[i] = t, e = 0; e < 1 << wn[i]; e++)
      or[t++] = i;
  for (or[t - 1] = i, n = 0, i = 0; i < 16; i++)
    for (Xr[i] = n, e = 0; e < 1 << Ur[i]; e++)
      sr[n++] = i;
  for (n >>= 7; i < At; i++)
    for (Xr[i] = n << 7, e = 0; e < 1 << Ur[i] - 7; e++)
      sr[256 + n++] = i;
  for (r = 0; r <= ct; r++)
    a[r] = 0;
  for (e = 0; e <= 143; )
    Ke[e * 2 + 1] = 8, e++, a[8]++;
  for (; e <= 255; )
    Ke[e * 2 + 1] = 9, e++, a[9]++;
  for (; e <= 279; )
    Ke[e * 2 + 1] = 7, e++, a[7]++;
  for (; e <= 287; )
    Ke[e * 2 + 1] = 8, e++, a[8]++;
  for (yf(Ke, ar + 1, a), e = 0; e < At; e++)
    Yt[e * 2 + 1] = 5, Yt[e * 2] = mf(e, 5);
  vf = new Ji(Ke, wn, vr + 1, ar, ct), pf = new Ji(Yt, Ur, 0, At, ct), _f = new Ji(new Array(0), pd, 0, ea, vd);
}
function wf(e) {
  var r;
  for (r = 0; r < ar; r++)
    e.dyn_ltree[r * 2] = 0;
  for (r = 0; r < At; r++)
    e.dyn_dtree[r * 2] = 0;
  for (r = 0; r < ea; r++)
    e.bl_tree[r * 2] = 0;
  e.dyn_ltree[ta * 2] = 1, e.opt_len = e.static_len = 0, e.last_lit = e.matches = 0;
}
function Ef(e) {
  e.bi_valid > 8 ? fr(e, e.bi_buf) : e.bi_valid > 0 && (e.pending_buf[e.pending++] = e.bi_buf), e.bi_buf = 0, e.bi_valid = 0;
}
function wd(e, r, t, i) {
  Ef(e), fr(e, t), fr(e, ~t), od.arraySet(e.pending_buf, e.window, r, t, e.pending), e.pending += t;
}
function Ts(e, r, t, i) {
  var n = r * 2, a = t * 2;
  return e[n] < e[a] || e[n] === e[a] && i[r] <= i[t];
}
function en(e, r, t) {
  for (var i = e.heap[t], n = t << 1; n <= e.heap_len && (n < e.heap_len && Ts(r, e.heap[n + 1], e.heap[n], e.depth) && n++, !Ts(r, i, e.heap[n], e.depth)); )
    e.heap[t] = e.heap[n], t = n, n <<= 1;
  e.heap[t] = i;
}
function As(e, r, t) {
  var i, n, a = 0, s, f;
  if (e.last_lit !== 0)
    do
      i = e.pending_buf[e.d_buf + a * 2] << 8 | e.pending_buf[e.d_buf + a * 2 + 1], n = e.pending_buf[e.l_buf + a], a++, i === 0 ? Ue(e, n, r) : (s = or[n], Ue(e, s + vr + 1, r), f = wn[s], f !== 0 && (n -= ra[s], we(e, n, f)), i--, s = gf(i), Ue(e, s, t), f = Ur[s], f !== 0 && (i -= Xr[s], we(e, i, f)));
    while (a < e.last_lit);
  Ue(e, ta, r);
}
function En(e, r) {
  var t = r.dyn_tree, i = r.stat_desc.static_tree, n = r.stat_desc.has_stree, a = r.stat_desc.elems, s, f, c = -1, o;
  for (e.heap_len = 0, e.heap_max = lf, s = 0; s < a; s++)
    t[s * 2] !== 0 ? (e.heap[++e.heap_len] = c = s, e.depth[s] = 0) : t[s * 2 + 1] = 0;
  for (; e.heap_len < 2; )
    o = e.heap[++e.heap_len] = c < 2 ? ++c : 0, t[o * 2] = 1, e.depth[o] = 0, e.opt_len--, n && (e.static_len -= i[o * 2 + 1]);
  for (r.max_code = c, s = e.heap_len >> 1; s >= 1; s--)
    en(e, t, s);
  o = a;
  do
    s = e.heap[
      1
      /*SMALLEST*/
    ], e.heap[
      1
      /*SMALLEST*/
    ] = e.heap[e.heap_len--], en(
      e,
      t,
      1
      /*SMALLEST*/
    ), f = e.heap[
      1
      /*SMALLEST*/
    ], e.heap[--e.heap_max] = s, e.heap[--e.heap_max] = f, t[o * 2] = t[s * 2] + t[f * 2], e.depth[o] = (e.depth[s] >= e.depth[f] ? e.depth[s] : e.depth[f]) + 1, t[s * 2 + 1] = t[f * 2 + 1] = o, e.heap[
      1
      /*SMALLEST*/
    ] = o++, en(
      e,
      t,
      1
      /*SMALLEST*/
    );
  while (e.heap_len >= 2);
  e.heap[--e.heap_max] = e.heap[
    1
    /*SMALLEST*/
  ], md(e, r), yf(t, c, e.bl_count);
}
function $s(e, r, t) {
  var i, n = -1, a, s = r[0 * 2 + 1], f = 0, c = 7, o = 4;
  for (s === 0 && (c = 138, o = 3), r[(t + 1) * 2 + 1] = 65535, i = 0; i <= t; i++)
    a = s, s = r[(i + 1) * 2 + 1], !(++f < c && a === s) && (f < o ? e.bl_tree[a * 2] += f : a !== 0 ? (a !== n && e.bl_tree[a * 2]++, e.bl_tree[uf * 2]++) : f <= 10 ? e.bl_tree[cf * 2]++ : e.bl_tree[hf * 2]++, f = 0, n = a, s === 0 ? (c = 138, o = 3) : a === s ? (c = 6, o = 3) : (c = 7, o = 4));
}
function Is(e, r, t) {
  var i, n = -1, a, s = r[0 * 2 + 1], f = 0, c = 7, o = 4;
  for (s === 0 && (c = 138, o = 3), i = 0; i <= t; i++)
    if (a = s, s = r[(i + 1) * 2 + 1], !(++f < c && a === s)) {
      if (f < o)
        do
          Ue(e, a, e.bl_tree);
        while (--f !== 0);
      else a !== 0 ? (a !== n && (Ue(e, a, e.bl_tree), f--), Ue(e, uf, e.bl_tree), we(e, f - 3, 2)) : f <= 10 ? (Ue(e, cf, e.bl_tree), we(e, f - 3, 3)) : (Ue(e, hf, e.bl_tree), we(e, f - 11, 7));
      f = 0, n = a, s === 0 ? (c = 138, o = 3) : a === s ? (c = 6, o = 3) : (c = 7, o = 4);
    }
}
function Ed(e) {
  var r;
  for ($s(e, e.dyn_ltree, e.l_desc.max_code), $s(e, e.dyn_dtree, e.d_desc.max_code), En(e, e.bl_desc), r = ea - 1; r >= 3 && e.bl_tree[df[r] * 2 + 1] === 0; r--)
    ;
  return e.opt_len += 3 * (r + 1) + 5 + 5 + 4, r;
}
function bd(e, r, t, i) {
  var n;
  for (we(e, r - 257, 5), we(e, t - 1, 5), we(e, i - 4, 4), n = 0; n < i; n++)
    we(e, e.bl_tree[df[n] * 2 + 1], 3);
  Is(e, e.dyn_ltree, r - 1), Is(e, e.dyn_dtree, t - 1);
}
function Sd(e) {
  var r = 4093624447, t;
  for (t = 0; t <= 31; t++, r >>>= 1)
    if (r & 1 && e.dyn_ltree[t * 2] !== 0)
      return Rs;
  if (e.dyn_ltree[9 * 2] !== 0 || e.dyn_ltree[10 * 2] !== 0 || e.dyn_ltree[13 * 2] !== 0)
    return Os;
  for (t = 32; t < vr; t++)
    if (e.dyn_ltree[t * 2] !== 0)
      return Os;
  return Rs;
}
var Cs = !1;
function kd(e) {
  Cs || (yd(), Cs = !0), e.l_desc = new Qi(e.dyn_ltree, vf), e.d_desc = new Qi(e.dyn_dtree, pf), e.bl_desc = new Qi(e.bl_tree, _f), e.bi_buf = 0, e.bi_valid = 0, wf(e);
}
function bf(e, r, t, i) {
  we(e, (ud << 1) + (i ? 1 : 0), 3), wd(e, r, t);
}
function xd(e) {
  we(e, ff << 1, 3), Ue(e, ta, Ke), gd(e);
}
function Rd(e, r, t, i) {
  var n, a, s = 0;
  e.level > 0 ? (e.strm.data_type === ld && (e.strm.data_type = Sd(e)), En(e, e.l_desc), En(e, e.d_desc), s = Ed(e), n = e.opt_len + 3 + 7 >>> 3, a = e.static_len + 3 + 7 >>> 3, a <= n && (n = a)) : n = a = t + 5, t + 4 <= n && r !== -1 ? bf(e, r, t, i) : e.strategy === fd || a === n ? (we(e, (ff << 1) + (i ? 1 : 0), 3), As(e, Ke, Yt)) : (we(e, (cd << 1) + (i ? 1 : 0), 3), bd(e, e.l_desc.max_code + 1, e.d_desc.max_code + 1, s + 1), As(e, e.dyn_ltree, e.dyn_dtree)), wf(e), i && Ef(e);
}
function Od(e, r, t) {
  return e.pending_buf[e.d_buf + e.last_lit * 2] = r >>> 8 & 255, e.pending_buf[e.d_buf + e.last_lit * 2 + 1] = r & 255, e.pending_buf[e.l_buf + e.last_lit] = t & 255, e.last_lit++, r === 0 ? e.dyn_ltree[t * 2]++ : (e.matches++, r--, e.dyn_ltree[(or[t] + vr + 1) * 2]++, e.dyn_dtree[gf(r) * 2]++), e.last_lit === e.lit_bufsize - 1;
}
Bt._tr_init = kd;
Bt._tr_stored_block = bf;
Bt._tr_flush_block = Rd;
Bt._tr_tally = Od;
Bt._tr_align = xd;
function Td(e, r, t, i) {
  for (var n = e & 65535 | 0, a = e >>> 16 & 65535 | 0, s = 0; t !== 0; ) {
    s = t > 2e3 ? 2e3 : t, t -= s;
    do
      n = n + r[i++] | 0, a = a + n | 0;
    while (--s);
    n %= 65521, a %= 65521;
  }
  return n | a << 16 | 0;
}
var Sf = Td;
function Ad() {
  for (var e, r = [], t = 0; t < 256; t++) {
    e = t;
    for (var i = 0; i < 8; i++)
      e = e & 1 ? 3988292384 ^ e >>> 1 : e >>> 1;
    r[t] = e;
  }
  return r;
}
var $d = Ad();
function Id(e, r, t, i) {
  var n = $d, a = i + t;
  e ^= -1;
  for (var s = i; s < a; s++)
    e = e >>> 8 ^ n[(e ^ r[s]) & 255];
  return e ^ -1;
}
var kf = Id, ia = {
  2: "need dictionary",
  /* Z_NEED_DICT       2  */
  1: "stream end",
  /* Z_STREAM_END      1  */
  0: "",
  /* Z_OK              0  */
  "-1": "file error",
  /* Z_ERRNO         (-1) */
  "-2": "stream error",
  /* Z_STREAM_ERROR  (-2) */
  "-3": "data error",
  /* Z_DATA_ERROR    (-3) */
  "-4": "insufficient memory",
  /* Z_MEM_ERROR     (-4) */
  "-5": "buffer error",
  /* Z_BUF_ERROR     (-5) */
  "-6": "incompatible version"
  /* Z_VERSION_ERROR (-6) */
}, me = Qe, ke = Bt, xf = Sf, rt = kf, Cd = ia, yt = 0, Nd = 1, Ld = 3, ot = 4, Ns = 5, ze = 0, Ls = 1, xe = -2, Dd = -3, tn = -5, Pd = -1, jd = 1, Ir = 2, Fd = 3, Bd = 4, Md = 0, Ud = 2, hi = 8, zd = 9, Gd = 15, Zd = 8, Wd = 29, qd = 256, bn = qd + 1 + Wd, Hd = 30, Vd = 19, Xd = 2 * bn + 1, Yd = 15, te = 3, at = 258, Ce = at + te + 1, Kd = 32, di = 42, Sn = 69, zr = 73, Gr = 91, Zr = 103, ht = 113, Xt = 666, de = 1, pr = 2, vt = 3, Ut = 4, Jd = 3;
function st(e, r) {
  return e.msg = Cd[r], r;
}
function Ds(e) {
  return (e << 1) - (e > 4 ? 9 : 0);
}
function nt(e) {
  for (var r = e.length; --r >= 0; )
    e[r] = 0;
}
function it(e) {
  var r = e.state, t = r.pending;
  t > e.avail_out && (t = e.avail_out), t !== 0 && (me.arraySet(e.output, r.pending_buf, r.pending_out, t, e.next_out), e.next_out += t, r.pending_out += t, e.total_out += t, e.avail_out -= t, r.pending -= t, r.pending === 0 && (r.pending_out = 0));
}
function ge(e, r) {
  ke._tr_flush_block(e, e.block_start >= 0 ? e.block_start : -1, e.strstart - e.block_start, r), e.block_start = e.strstart, it(e.strm);
}
function re(e, r) {
  e.pending_buf[e.pending++] = r;
}
function Ht(e, r) {
  e.pending_buf[e.pending++] = r >>> 8 & 255, e.pending_buf[e.pending++] = r & 255;
}
function Qd(e, r, t, i) {
  var n = e.avail_in;
  return n > i && (n = i), n === 0 ? 0 : (e.avail_in -= n, me.arraySet(r, e.input, e.next_in, n, t), e.state.wrap === 1 ? e.adler = xf(e.adler, r, n, t) : e.state.wrap === 2 && (e.adler = rt(e.adler, r, n, t)), e.next_in += n, e.total_in += n, n);
}
function Rf(e, r) {
  var t = e.max_chain_length, i = e.strstart, n, a, s = e.prev_length, f = e.nice_match, c = e.strstart > e.w_size - Ce ? e.strstart - (e.w_size - Ce) : 0, o = e.window, d = e.w_mask, m = e.prev, u = e.strstart + at, h = o[i + s - 1], p = o[i + s];
  e.prev_length >= e.good_match && (t >>= 2), f > e.lookahead && (f = e.lookahead);
  do
    if (n = r, !(o[n + s] !== p || o[n + s - 1] !== h || o[n] !== o[i] || o[++n] !== o[i + 1])) {
      i += 2, n++;
      do
        ;
      while (o[++i] === o[++n] && o[++i] === o[++n] && o[++i] === o[++n] && o[++i] === o[++n] && o[++i] === o[++n] && o[++i] === o[++n] && o[++i] === o[++n] && o[++i] === o[++n] && i < u);
      if (a = at - (u - i), i = u - at, a > s) {
        if (e.match_start = r, s = a, a >= f)
          break;
        h = o[i + s - 1], p = o[i + s];
      }
    }
  while ((r = m[r & d]) > c && --t !== 0);
  return s <= e.lookahead ? s : e.lookahead;
}
function pt(e) {
  var r = e.w_size, t, i, n, a, s;
  do {
    if (a = e.window_size - e.lookahead - e.strstart, e.strstart >= r + (r - Ce)) {
      me.arraySet(e.window, e.window, r, r, 0), e.match_start -= r, e.strstart -= r, e.block_start -= r, i = e.hash_size, t = i;
      do
        n = e.head[--t], e.head[t] = n >= r ? n - r : 0;
      while (--i);
      i = r, t = i;
      do
        n = e.prev[--t], e.prev[t] = n >= r ? n - r : 0;
      while (--i);
      a += r;
    }
    if (e.strm.avail_in === 0)
      break;
    if (i = Qd(e.strm, e.window, e.strstart + e.lookahead, a), e.lookahead += i, e.lookahead + e.insert >= te)
      for (s = e.strstart - e.insert, e.ins_h = e.window[s], e.ins_h = (e.ins_h << e.hash_shift ^ e.window[s + 1]) & e.hash_mask; e.insert && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[s + te - 1]) & e.hash_mask, e.prev[s & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = s, s++, e.insert--, !(e.lookahead + e.insert < te)); )
        ;
  } while (e.lookahead < Ce && e.strm.avail_in !== 0);
}
function ev(e, r) {
  var t = 65535;
  for (t > e.pending_buf_size - 5 && (t = e.pending_buf_size - 5); ; ) {
    if (e.lookahead <= 1) {
      if (pt(e), e.lookahead === 0 && r === yt)
        return de;
      if (e.lookahead === 0)
        break;
    }
    e.strstart += e.lookahead, e.lookahead = 0;
    var i = e.block_start + t;
    if ((e.strstart === 0 || e.strstart >= i) && (e.lookahead = e.strstart - i, e.strstart = i, ge(e, !1), e.strm.avail_out === 0) || e.strstart - e.block_start >= e.w_size - Ce && (ge(e, !1), e.strm.avail_out === 0))
      return de;
  }
  return e.insert = 0, r === ot ? (ge(e, !0), e.strm.avail_out === 0 ? vt : Ut) : (e.strstart > e.block_start && (ge(e, !1), e.strm.avail_out === 0), de);
}
function rn(e, r) {
  for (var t, i; ; ) {
    if (e.lookahead < Ce) {
      if (pt(e), e.lookahead < Ce && r === yt)
        return de;
      if (e.lookahead === 0)
        break;
    }
    if (t = 0, e.lookahead >= te && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + te - 1]) & e.hash_mask, t = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), t !== 0 && e.strstart - t <= e.w_size - Ce && (e.match_length = Rf(e, t)), e.match_length >= te)
      if (i = ke._tr_tally(e, e.strstart - e.match_start, e.match_length - te), e.lookahead -= e.match_length, e.match_length <= e.max_lazy_match && e.lookahead >= te) {
        e.match_length--;
        do
          e.strstart++, e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + te - 1]) & e.hash_mask, t = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart;
        while (--e.match_length !== 0);
        e.strstart++;
      } else
        e.strstart += e.match_length, e.match_length = 0, e.ins_h = e.window[e.strstart], e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + 1]) & e.hash_mask;
    else
      i = ke._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++;
    if (i && (ge(e, !1), e.strm.avail_out === 0))
      return de;
  }
  return e.insert = e.strstart < te - 1 ? e.strstart : te - 1, r === ot ? (ge(e, !0), e.strm.avail_out === 0 ? vt : Ut) : e.last_lit && (ge(e, !1), e.strm.avail_out === 0) ? de : pr;
}
function kt(e, r) {
  for (var t, i, n; ; ) {
    if (e.lookahead < Ce) {
      if (pt(e), e.lookahead < Ce && r === yt)
        return de;
      if (e.lookahead === 0)
        break;
    }
    if (t = 0, e.lookahead >= te && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + te - 1]) & e.hash_mask, t = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), e.prev_length = e.match_length, e.prev_match = e.match_start, e.match_length = te - 1, t !== 0 && e.prev_length < e.max_lazy_match && e.strstart - t <= e.w_size - Ce && (e.match_length = Rf(e, t), e.match_length <= 5 && (e.strategy === jd || e.match_length === te && e.strstart - e.match_start > 4096) && (e.match_length = te - 1)), e.prev_length >= te && e.match_length <= e.prev_length) {
      n = e.strstart + e.lookahead - te, i = ke._tr_tally(e, e.strstart - 1 - e.prev_match, e.prev_length - te), e.lookahead -= e.prev_length - 1, e.prev_length -= 2;
      do
        ++e.strstart <= n && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + te - 1]) & e.hash_mask, t = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart);
      while (--e.prev_length !== 0);
      if (e.match_available = 0, e.match_length = te - 1, e.strstart++, i && (ge(e, !1), e.strm.avail_out === 0))
        return de;
    } else if (e.match_available) {
      if (i = ke._tr_tally(e, 0, e.window[e.strstart - 1]), i && ge(e, !1), e.strstart++, e.lookahead--, e.strm.avail_out === 0)
        return de;
    } else
      e.match_available = 1, e.strstart++, e.lookahead--;
  }
  return e.match_available && (i = ke._tr_tally(e, 0, e.window[e.strstart - 1]), e.match_available = 0), e.insert = e.strstart < te - 1 ? e.strstart : te - 1, r === ot ? (ge(e, !0), e.strm.avail_out === 0 ? vt : Ut) : e.last_lit && (ge(e, !1), e.strm.avail_out === 0) ? de : pr;
}
function tv(e, r) {
  for (var t, i, n, a, s = e.window; ; ) {
    if (e.lookahead <= at) {
      if (pt(e), e.lookahead <= at && r === yt)
        return de;
      if (e.lookahead === 0)
        break;
    }
    if (e.match_length = 0, e.lookahead >= te && e.strstart > 0 && (n = e.strstart - 1, i = s[n], i === s[++n] && i === s[++n] && i === s[++n])) {
      a = e.strstart + at;
      do
        ;
      while (i === s[++n] && i === s[++n] && i === s[++n] && i === s[++n] && i === s[++n] && i === s[++n] && i === s[++n] && i === s[++n] && n < a);
      e.match_length = at - (a - n), e.match_length > e.lookahead && (e.match_length = e.lookahead);
    }
    if (e.match_length >= te ? (t = ke._tr_tally(e, 1, e.match_length - te), e.lookahead -= e.match_length, e.strstart += e.match_length, e.match_length = 0) : (t = ke._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++), t && (ge(e, !1), e.strm.avail_out === 0))
      return de;
  }
  return e.insert = 0, r === ot ? (ge(e, !0), e.strm.avail_out === 0 ? vt : Ut) : e.last_lit && (ge(e, !1), e.strm.avail_out === 0) ? de : pr;
}
function rv(e, r) {
  for (var t; ; ) {
    if (e.lookahead === 0 && (pt(e), e.lookahead === 0)) {
      if (r === yt)
        return de;
      break;
    }
    if (e.match_length = 0, t = ke._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++, t && (ge(e, !1), e.strm.avail_out === 0))
      return de;
  }
  return e.insert = 0, r === ot ? (ge(e, !0), e.strm.avail_out === 0 ? vt : Ut) : e.last_lit && (ge(e, !1), e.strm.avail_out === 0) ? de : pr;
}
function Fe(e, r, t, i, n) {
  this.good_length = e, this.max_lazy = r, this.nice_length = t, this.max_chain = i, this.func = n;
}
var Ot;
Ot = [
  /*      good lazy nice chain */
  new Fe(0, 0, 0, 0, ev),
  /* 0 store only */
  new Fe(4, 4, 8, 4, rn),
  /* 1 max speed, no lazy matches */
  new Fe(4, 5, 16, 8, rn),
  /* 2 */
  new Fe(4, 6, 32, 32, rn),
  /* 3 */
  new Fe(4, 4, 16, 16, kt),
  /* 4 lazy matches */
  new Fe(8, 16, 32, 32, kt),
  /* 5 */
  new Fe(8, 16, 128, 128, kt),
  /* 6 */
  new Fe(8, 32, 128, 256, kt),
  /* 7 */
  new Fe(32, 128, 258, 1024, kt),
  /* 8 */
  new Fe(32, 258, 258, 4096, kt)
  /* 9 max compression */
];
function iv(e) {
  e.window_size = 2 * e.w_size, nt(e.head), e.max_lazy_match = Ot[e.level].max_lazy, e.good_match = Ot[e.level].good_length, e.nice_match = Ot[e.level].nice_length, e.max_chain_length = Ot[e.level].max_chain, e.strstart = 0, e.block_start = 0, e.lookahead = 0, e.insert = 0, e.match_length = e.prev_length = te - 1, e.match_available = 0, e.ins_h = 0;
}
function nv() {
  this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = hi, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new me.Buf16(Xd * 2), this.dyn_dtree = new me.Buf16((2 * Hd + 1) * 2), this.bl_tree = new me.Buf16((2 * Vd + 1) * 2), nt(this.dyn_ltree), nt(this.dyn_dtree), nt(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new me.Buf16(Yd + 1), this.heap = new me.Buf16(2 * bn + 1), nt(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new me.Buf16(2 * bn + 1), nt(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
}
function Of(e) {
  var r;
  return !e || !e.state ? st(e, xe) : (e.total_in = e.total_out = 0, e.data_type = Ud, r = e.state, r.pending = 0, r.pending_out = 0, r.wrap < 0 && (r.wrap = -r.wrap), r.status = r.wrap ? di : ht, e.adler = r.wrap === 2 ? 0 : 1, r.last_flush = yt, ke._tr_init(r), ze);
}
function Tf(e) {
  var r = Of(e);
  return r === ze && iv(e.state), r;
}
function av(e, r) {
  return !e || !e.state || e.state.wrap !== 2 ? xe : (e.state.gzhead = r, ze);
}
function Af(e, r, t, i, n, a) {
  if (!e)
    return xe;
  var s = 1;
  if (r === Pd && (r = 6), i < 0 ? (s = 0, i = -i) : i > 15 && (s = 2, i -= 16), n < 1 || n > zd || t !== hi || i < 8 || i > 15 || r < 0 || r > 9 || a < 0 || a > Bd)
    return st(e, xe);
  i === 8 && (i = 9);
  var f = new nv();
  return e.state = f, f.strm = e, f.wrap = s, f.gzhead = null, f.w_bits = i, f.w_size = 1 << f.w_bits, f.w_mask = f.w_size - 1, f.hash_bits = n + 7, f.hash_size = 1 << f.hash_bits, f.hash_mask = f.hash_size - 1, f.hash_shift = ~~((f.hash_bits + te - 1) / te), f.window = new me.Buf8(f.w_size * 2), f.head = new me.Buf16(f.hash_size), f.prev = new me.Buf16(f.w_size), f.lit_bufsize = 1 << n + 6, f.pending_buf_size = f.lit_bufsize * 4, f.pending_buf = new me.Buf8(f.pending_buf_size), f.d_buf = 1 * f.lit_bufsize, f.l_buf = 3 * f.lit_bufsize, f.level = r, f.strategy = a, f.method = t, Tf(e);
}
function sv(e, r) {
  return Af(e, r, hi, Gd, Zd, Md);
}
function ov(e, r) {
  var t, i, n, a;
  if (!e || !e.state || r > Ns || r < 0)
    return e ? st(e, xe) : xe;
  if (i = e.state, !e.output || !e.input && e.avail_in !== 0 || i.status === Xt && r !== ot)
    return st(e, e.avail_out === 0 ? tn : xe);
  if (i.strm = e, t = i.last_flush, i.last_flush = r, i.status === di)
    if (i.wrap === 2)
      e.adler = 0, re(i, 31), re(i, 139), re(i, 8), i.gzhead ? (re(
        i,
        (i.gzhead.text ? 1 : 0) + (i.gzhead.hcrc ? 2 : 0) + (i.gzhead.extra ? 4 : 0) + (i.gzhead.name ? 8 : 0) + (i.gzhead.comment ? 16 : 0)
      ), re(i, i.gzhead.time & 255), re(i, i.gzhead.time >> 8 & 255), re(i, i.gzhead.time >> 16 & 255), re(i, i.gzhead.time >> 24 & 255), re(i, i.level === 9 ? 2 : i.strategy >= Ir || i.level < 2 ? 4 : 0), re(i, i.gzhead.os & 255), i.gzhead.extra && i.gzhead.extra.length && (re(i, i.gzhead.extra.length & 255), re(i, i.gzhead.extra.length >> 8 & 255)), i.gzhead.hcrc && (e.adler = rt(e.adler, i.pending_buf, i.pending, 0)), i.gzindex = 0, i.status = Sn) : (re(i, 0), re(i, 0), re(i, 0), re(i, 0), re(i, 0), re(i, i.level === 9 ? 2 : i.strategy >= Ir || i.level < 2 ? 4 : 0), re(i, Jd), i.status = ht);
    else {
      var s = hi + (i.w_bits - 8 << 4) << 8, f = -1;
      i.strategy >= Ir || i.level < 2 ? f = 0 : i.level < 6 ? f = 1 : i.level === 6 ? f = 2 : f = 3, s |= f << 6, i.strstart !== 0 && (s |= Kd), s += 31 - s % 31, i.status = ht, Ht(i, s), i.strstart !== 0 && (Ht(i, e.adler >>> 16), Ht(i, e.adler & 65535)), e.adler = 1;
    }
  if (i.status === Sn)
    if (i.gzhead.extra) {
      for (n = i.pending; i.gzindex < (i.gzhead.extra.length & 65535) && !(i.pending === i.pending_buf_size && (i.gzhead.hcrc && i.pending > n && (e.adler = rt(e.adler, i.pending_buf, i.pending - n, n)), it(e), n = i.pending, i.pending === i.pending_buf_size)); )
        re(i, i.gzhead.extra[i.gzindex] & 255), i.gzindex++;
      i.gzhead.hcrc && i.pending > n && (e.adler = rt(e.adler, i.pending_buf, i.pending - n, n)), i.gzindex === i.gzhead.extra.length && (i.gzindex = 0, i.status = zr);
    } else
      i.status = zr;
  if (i.status === zr)
    if (i.gzhead.name) {
      n = i.pending;
      do {
        if (i.pending === i.pending_buf_size && (i.gzhead.hcrc && i.pending > n && (e.adler = rt(e.adler, i.pending_buf, i.pending - n, n)), it(e), n = i.pending, i.pending === i.pending_buf_size)) {
          a = 1;
          break;
        }
        i.gzindex < i.gzhead.name.length ? a = i.gzhead.name.charCodeAt(i.gzindex++) & 255 : a = 0, re(i, a);
      } while (a !== 0);
      i.gzhead.hcrc && i.pending > n && (e.adler = rt(e.adler, i.pending_buf, i.pending - n, n)), a === 0 && (i.gzindex = 0, i.status = Gr);
    } else
      i.status = Gr;
  if (i.status === Gr)
    if (i.gzhead.comment) {
      n = i.pending;
      do {
        if (i.pending === i.pending_buf_size && (i.gzhead.hcrc && i.pending > n && (e.adler = rt(e.adler, i.pending_buf, i.pending - n, n)), it(e), n = i.pending, i.pending === i.pending_buf_size)) {
          a = 1;
          break;
        }
        i.gzindex < i.gzhead.comment.length ? a = i.gzhead.comment.charCodeAt(i.gzindex++) & 255 : a = 0, re(i, a);
      } while (a !== 0);
      i.gzhead.hcrc && i.pending > n && (e.adler = rt(e.adler, i.pending_buf, i.pending - n, n)), a === 0 && (i.status = Zr);
    } else
      i.status = Zr;
  if (i.status === Zr && (i.gzhead.hcrc ? (i.pending + 2 > i.pending_buf_size && it(e), i.pending + 2 <= i.pending_buf_size && (re(i, e.adler & 255), re(i, e.adler >> 8 & 255), e.adler = 0, i.status = ht)) : i.status = ht), i.pending !== 0) {
    if (it(e), e.avail_out === 0)
      return i.last_flush = -1, ze;
  } else if (e.avail_in === 0 && Ds(r) <= Ds(t) && r !== ot)
    return st(e, tn);
  if (i.status === Xt && e.avail_in !== 0)
    return st(e, tn);
  if (e.avail_in !== 0 || i.lookahead !== 0 || r !== yt && i.status !== Xt) {
    var c = i.strategy === Ir ? rv(i, r) : i.strategy === Fd ? tv(i, r) : Ot[i.level].func(i, r);
    if ((c === vt || c === Ut) && (i.status = Xt), c === de || c === vt)
      return e.avail_out === 0 && (i.last_flush = -1), ze;
    if (c === pr && (r === Nd ? ke._tr_align(i) : r !== Ns && (ke._tr_stored_block(i, 0, 0, !1), r === Ld && (nt(i.head), i.lookahead === 0 && (i.strstart = 0, i.block_start = 0, i.insert = 0))), it(e), e.avail_out === 0))
      return i.last_flush = -1, ze;
  }
  return r !== ot ? ze : i.wrap <= 0 ? Ls : (i.wrap === 2 ? (re(i, e.adler & 255), re(i, e.adler >> 8 & 255), re(i, e.adler >> 16 & 255), re(i, e.adler >> 24 & 255), re(i, e.total_in & 255), re(i, e.total_in >> 8 & 255), re(i, e.total_in >> 16 & 255), re(i, e.total_in >> 24 & 255)) : (Ht(i, e.adler >>> 16), Ht(i, e.adler & 65535)), it(e), i.wrap > 0 && (i.wrap = -i.wrap), i.pending !== 0 ? ze : Ls);
}
function fv(e) {
  var r;
  return !e || !e.state ? xe : (r = e.state.status, r !== di && r !== Sn && r !== zr && r !== Gr && r !== Zr && r !== ht && r !== Xt ? st(e, xe) : (e.state = null, r === ht ? st(e, Dd) : ze));
}
function lv(e, r) {
  var t = r.length, i, n, a, s, f, c, o, d;
  if (!e || !e.state || (i = e.state, s = i.wrap, s === 2 || s === 1 && i.status !== di || i.lookahead))
    return xe;
  for (s === 1 && (e.adler = xf(e.adler, r, t, 0)), i.wrap = 0, t >= i.w_size && (s === 0 && (nt(i.head), i.strstart = 0, i.block_start = 0, i.insert = 0), d = new me.Buf8(i.w_size), me.arraySet(d, r, t - i.w_size, i.w_size, 0), r = d, t = i.w_size), f = e.avail_in, c = e.next_in, o = e.input, e.avail_in = t, e.next_in = 0, e.input = r, pt(i); i.lookahead >= te; ) {
    n = i.strstart, a = i.lookahead - (te - 1);
    do
      i.ins_h = (i.ins_h << i.hash_shift ^ i.window[n + te - 1]) & i.hash_mask, i.prev[n & i.w_mask] = i.head[i.ins_h], i.head[i.ins_h] = n, n++;
    while (--a);
    i.strstart = n, i.lookahead = te - 1, pt(i);
  }
  return i.strstart += i.lookahead, i.block_start = i.strstart, i.insert = i.lookahead, i.lookahead = 0, i.match_length = i.prev_length = te - 1, i.match_available = 0, e.next_in = c, e.input = o, e.avail_in = f, i.wrap = s, ze;
}
Ge.deflateInit = sv;
Ge.deflateInit2 = Af;
Ge.deflateReset = Tf;
Ge.deflateResetKeep = Of;
Ge.deflateSetHeader = av;
Ge.deflate = ov;
Ge.deflateEnd = fv;
Ge.deflateSetDictionary = lv;
Ge.deflateInfo = "pako deflate (from Nodeca project)";
var wt = {}, vi = Qe, $f = !0, If = !0;
try {
  String.fromCharCode.apply(null, [0]);
} catch {
  $f = !1;
}
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch {
  If = !1;
}
var lr = new vi.Buf8(256);
for (var et = 0; et < 256; et++)
  lr[et] = et >= 252 ? 6 : et >= 248 ? 5 : et >= 240 ? 4 : et >= 224 ? 3 : et >= 192 ? 2 : 1;
lr[254] = lr[254] = 1;
wt.string2buf = function(e) {
  var r, t, i, n, a, s = e.length, f = 0;
  for (n = 0; n < s; n++)
    t = e.charCodeAt(n), (t & 64512) === 55296 && n + 1 < s && (i = e.charCodeAt(n + 1), (i & 64512) === 56320 && (t = 65536 + (t - 55296 << 10) + (i - 56320), n++)), f += t < 128 ? 1 : t < 2048 ? 2 : t < 65536 ? 3 : 4;
  for (r = new vi.Buf8(f), a = 0, n = 0; a < f; n++)
    t = e.charCodeAt(n), (t & 64512) === 55296 && n + 1 < s && (i = e.charCodeAt(n + 1), (i & 64512) === 56320 && (t = 65536 + (t - 55296 << 10) + (i - 56320), n++)), t < 128 ? r[a++] = t : t < 2048 ? (r[a++] = 192 | t >>> 6, r[a++] = 128 | t & 63) : t < 65536 ? (r[a++] = 224 | t >>> 12, r[a++] = 128 | t >>> 6 & 63, r[a++] = 128 | t & 63) : (r[a++] = 240 | t >>> 18, r[a++] = 128 | t >>> 12 & 63, r[a++] = 128 | t >>> 6 & 63, r[a++] = 128 | t & 63);
  return r;
};
function Cf(e, r) {
  if (r < 65534 && (e.subarray && If || !e.subarray && $f))
    return String.fromCharCode.apply(null, vi.shrinkBuf(e, r));
  for (var t = "", i = 0; i < r; i++)
    t += String.fromCharCode(e[i]);
  return t;
}
wt.buf2binstring = function(e) {
  return Cf(e, e.length);
};
wt.binstring2buf = function(e) {
  for (var r = new vi.Buf8(e.length), t = 0, i = r.length; t < i; t++)
    r[t] = e.charCodeAt(t);
  return r;
};
wt.buf2string = function(e, r) {
  var t, i, n, a, s = r || e.length, f = new Array(s * 2);
  for (i = 0, t = 0; t < s; ) {
    if (n = e[t++], n < 128) {
      f[i++] = n;
      continue;
    }
    if (a = lr[n], a > 4) {
      f[i++] = 65533, t += a - 1;
      continue;
    }
    for (n &= a === 2 ? 31 : a === 3 ? 15 : 7; a > 1 && t < s; )
      n = n << 6 | e[t++] & 63, a--;
    if (a > 1) {
      f[i++] = 65533;
      continue;
    }
    n < 65536 ? f[i++] = n : (n -= 65536, f[i++] = 55296 | n >> 10 & 1023, f[i++] = 56320 | n & 1023);
  }
  return Cf(f, i);
};
wt.utf8border = function(e, r) {
  var t;
  for (r = r || e.length, r > e.length && (r = e.length), t = r - 1; t >= 0 && (e[t] & 192) === 128; )
    t--;
  return t < 0 || t === 0 ? r : t + lr[e[t]] > r ? t : r;
};
function uv() {
  this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
}
var Nf = uv, Kt = Ge, Jt = Qe, kn = wt, xn = ia, cv = Nf, Lf = Object.prototype.toString, hv = 0, nn = 4, $t = 0, Ps = 1, js = 2, dv = -1, vv = 0, pv = 8;
function _t(e) {
  if (!(this instanceof _t)) return new _t(e);
  this.options = Jt.assign({
    level: dv,
    method: pv,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: vv,
    to: ""
  }, e || {});
  var r = this.options;
  r.raw && r.windowBits > 0 ? r.windowBits = -r.windowBits : r.gzip && r.windowBits > 0 && r.windowBits < 16 && (r.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new cv(), this.strm.avail_out = 0;
  var t = Kt.deflateInit2(
    this.strm,
    r.level,
    r.method,
    r.windowBits,
    r.memLevel,
    r.strategy
  );
  if (t !== $t)
    throw new Error(xn[t]);
  if (r.header && Kt.deflateSetHeader(this.strm, r.header), r.dictionary) {
    var i;
    if (typeof r.dictionary == "string" ? i = kn.string2buf(r.dictionary) : Lf.call(r.dictionary) === "[object ArrayBuffer]" ? i = new Uint8Array(r.dictionary) : i = r.dictionary, t = Kt.deflateSetDictionary(this.strm, i), t !== $t)
      throw new Error(xn[t]);
    this._dict_set = !0;
  }
}
_t.prototype.push = function(e, r) {
  var t = this.strm, i = this.options.chunkSize, n, a;
  if (this.ended)
    return !1;
  a = r === ~~r ? r : r === !0 ? nn : hv, typeof e == "string" ? t.input = kn.string2buf(e) : Lf.call(e) === "[object ArrayBuffer]" ? t.input = new Uint8Array(e) : t.input = e, t.next_in = 0, t.avail_in = t.input.length;
  do {
    if (t.avail_out === 0 && (t.output = new Jt.Buf8(i), t.next_out = 0, t.avail_out = i), n = Kt.deflate(t, a), n !== Ps && n !== $t)
      return this.onEnd(n), this.ended = !0, !1;
    (t.avail_out === 0 || t.avail_in === 0 && (a === nn || a === js)) && (this.options.to === "string" ? this.onData(kn.buf2binstring(Jt.shrinkBuf(t.output, t.next_out))) : this.onData(Jt.shrinkBuf(t.output, t.next_out)));
  } while ((t.avail_in > 0 || t.avail_out === 0) && n !== Ps);
  return a === nn ? (n = Kt.deflateEnd(this.strm), this.onEnd(n), this.ended = !0, n === $t) : (a === js && (this.onEnd($t), t.avail_out = 0), !0);
};
_t.prototype.onData = function(e) {
  this.chunks.push(e);
};
_t.prototype.onEnd = function(e) {
  e === $t && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = Jt.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg;
};
function na(e, r) {
  var t = new _t(r);
  if (t.push(e, !0), t.err)
    throw t.msg || xn[t.err];
  return t.result;
}
function _v(e, r) {
  return r = r || {}, r.raw = !0, na(e, r);
}
function gv(e, r) {
  return r = r || {}, r.gzip = !0, na(e, r);
}
dr.Deflate = _t;
dr.deflate = na;
dr.deflateRaw = _v;
dr.gzip = gv;
var _r = {}, De = {}, Cr = 30, mv = 12, yv = function(r, t) {
  var i, n, a, s, f, c, o, d, m, u, h, p, v, x, l, _, R, g, E, $, A, T, b, I, O;
  i = r.state, n = r.next_in, I = r.input, a = n + (r.avail_in - 5), s = r.next_out, O = r.output, f = s - (t - r.avail_out), c = s + (r.avail_out - 257), o = i.dmax, d = i.wsize, m = i.whave, u = i.wnext, h = i.window, p = i.hold, v = i.bits, x = i.lencode, l = i.distcode, _ = (1 << i.lenbits) - 1, R = (1 << i.distbits) - 1;
  e:
    do {
      v < 15 && (p += I[n++] << v, v += 8, p += I[n++] << v, v += 8), g = x[p & _];
      t:
        for (; ; ) {
          if (E = g >>> 24, p >>>= E, v -= E, E = g >>> 16 & 255, E === 0)
            O[s++] = g & 65535;
          else if (E & 16) {
            $ = g & 65535, E &= 15, E && (v < E && (p += I[n++] << v, v += 8), $ += p & (1 << E) - 1, p >>>= E, v -= E), v < 15 && (p += I[n++] << v, v += 8, p += I[n++] << v, v += 8), g = l[p & R];
            r:
              for (; ; ) {
                if (E = g >>> 24, p >>>= E, v -= E, E = g >>> 16 & 255, E & 16) {
                  if (A = g & 65535, E &= 15, v < E && (p += I[n++] << v, v += 8, v < E && (p += I[n++] << v, v += 8)), A += p & (1 << E) - 1, A > o) {
                    r.msg = "invalid distance too far back", i.mode = Cr;
                    break e;
                  }
                  if (p >>>= E, v -= E, E = s - f, A > E) {
                    if (E = A - E, E > m && i.sane) {
                      r.msg = "invalid distance too far back", i.mode = Cr;
                      break e;
                    }
                    if (T = 0, b = h, u === 0) {
                      if (T += d - E, E < $) {
                        $ -= E;
                        do
                          O[s++] = h[T++];
                        while (--E);
                        T = s - A, b = O;
                      }
                    } else if (u < E) {
                      if (T += d + u - E, E -= u, E < $) {
                        $ -= E;
                        do
                          O[s++] = h[T++];
                        while (--E);
                        if (T = 0, u < $) {
                          E = u, $ -= E;
                          do
                            O[s++] = h[T++];
                          while (--E);
                          T = s - A, b = O;
                        }
                      }
                    } else if (T += u - E, E < $) {
                      $ -= E;
                      do
                        O[s++] = h[T++];
                      while (--E);
                      T = s - A, b = O;
                    }
                    for (; $ > 2; )
                      O[s++] = b[T++], O[s++] = b[T++], O[s++] = b[T++], $ -= 3;
                    $ && (O[s++] = b[T++], $ > 1 && (O[s++] = b[T++]));
                  } else {
                    T = s - A;
                    do
                      O[s++] = O[T++], O[s++] = O[T++], O[s++] = O[T++], $ -= 3;
                    while ($ > 2);
                    $ && (O[s++] = O[T++], $ > 1 && (O[s++] = O[T++]));
                  }
                } else if (E & 64) {
                  r.msg = "invalid distance code", i.mode = Cr;
                  break e;
                } else {
                  g = l[(g & 65535) + (p & (1 << E) - 1)];
                  continue r;
                }
                break;
              }
          } else if (E & 64)
            if (E & 32) {
              i.mode = mv;
              break e;
            } else {
              r.msg = "invalid literal/length code", i.mode = Cr;
              break e;
            }
          else {
            g = x[(g & 65535) + (p & (1 << E) - 1)];
            continue t;
          }
          break;
        }
    } while (n < a && s < c);
  $ = v >> 3, n -= $, v -= $ << 3, p &= (1 << v) - 1, r.next_in = n, r.next_out = s, r.avail_in = n < a ? 5 + (a - n) : 5 - (n - a), r.avail_out = s < c ? 257 + (c - s) : 257 - (s - c), i.hold = p, i.bits = v;
}, Fs = Qe, xt = 15, Bs = 852, Ms = 592, Us = 0, an = 1, zs = 2, wv = [
  /* Length codes 257..285 base */
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
], Ev = [
  /* Length codes 257..285 extra */
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  16,
  72,
  78
], bv = [
  /* Distance codes 0..29 base */
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
  0,
  0
], Sv = [
  /* Distance codes 0..29 extra */
  16,
  16,
  16,
  16,
  17,
  17,
  18,
  18,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  23,
  23,
  24,
  24,
  25,
  25,
  26,
  26,
  27,
  27,
  28,
  28,
  29,
  29,
  64,
  64
], kv = function(r, t, i, n, a, s, f, c) {
  var o = c.bits, d = 0, m = 0, u = 0, h = 0, p = 0, v = 0, x = 0, l = 0, _ = 0, R = 0, g, E, $, A, T, b = null, I = 0, O, L = new Fs.Buf16(xt + 1), B = new Fs.Buf16(xt + 1), N = null, P = 0, G, w, S;
  for (d = 0; d <= xt; d++)
    L[d] = 0;
  for (m = 0; m < n; m++)
    L[t[i + m]]++;
  for (p = o, h = xt; h >= 1 && L[h] === 0; h--)
    ;
  if (p > h && (p = h), h === 0)
    return a[s++] = 1 << 24 | 64 << 16 | 0, a[s++] = 1 << 24 | 64 << 16 | 0, c.bits = 1, 0;
  for (u = 1; u < h && L[u] === 0; u++)
    ;
  for (p < u && (p = u), l = 1, d = 1; d <= xt; d++)
    if (l <<= 1, l -= L[d], l < 0)
      return -1;
  if (l > 0 && (r === Us || h !== 1))
    return -1;
  for (B[1] = 0, d = 1; d < xt; d++)
    B[d + 1] = B[d] + L[d];
  for (m = 0; m < n; m++)
    t[i + m] !== 0 && (f[B[t[i + m]]++] = m);
  if (r === Us ? (b = N = f, O = 19) : r === an ? (b = wv, I -= 257, N = Ev, P -= 257, O = 256) : (b = bv, N = Sv, O = -1), R = 0, m = 0, d = u, T = s, v = p, x = 0, $ = -1, _ = 1 << p, A = _ - 1, r === an && _ > Bs || r === zs && _ > Ms)
    return 1;
  for (; ; ) {
    G = d - x, f[m] < O ? (w = 0, S = f[m]) : f[m] > O ? (w = N[P + f[m]], S = b[I + f[m]]) : (w = 96, S = 0), g = 1 << d - x, E = 1 << v, u = E;
    do
      E -= g, a[T + (R >> x) + E] = G << 24 | w << 16 | S | 0;
    while (E !== 0);
    for (g = 1 << d - 1; R & g; )
      g >>= 1;
    if (g !== 0 ? (R &= g - 1, R += g) : R = 0, m++, --L[d] === 0) {
      if (d === h)
        break;
      d = t[i + f[m]];
    }
    if (d > p && (R & A) !== $) {
      for (x === 0 && (x = p), T += u, v = d - x, l = 1 << v; v + x < h && (l -= L[v + x], !(l <= 0)); )
        v++, l <<= 1;
      if (_ += 1 << v, r === an && _ > Bs || r === zs && _ > Ms)
        return 1;
      $ = R & A, a[$] = p << 24 | v << 16 | T - s | 0;
    }
  }
  return R !== 0 && (a[T + R] = d - x << 24 | 64 << 16 | 0), c.bits = p, 0;
}, be = Qe, Rn = Sf, Be = kf, xv = yv, Qt = kv, Rv = 0, Df = 1, Pf = 2, Gs = 4, Ov = 5, Nr = 6, gt = 0, Tv = 1, Av = 2, Oe = -2, jf = -3, Ff = -4, $v = -5, Zs = 8, Bf = 1, Ws = 2, qs = 3, Hs = 4, Vs = 5, Xs = 6, Ys = 7, Ks = 8, Js = 9, Qs = 10, Yr = 11, Xe = 12, sn = 13, eo = 14, on = 15, to = 16, ro = 17, io = 18, no = 19, Lr = 20, Dr = 21, ao = 22, so = 23, oo = 24, fo = 25, lo = 26, fn = 27, uo = 28, co = 29, fe = 30, Mf = 31, Iv = 32, Cv = 852, Nv = 592, Lv = 15, Dv = Lv;
function ho(e) {
  return (e >>> 24 & 255) + (e >>> 8 & 65280) + ((e & 65280) << 8) + ((e & 255) << 24);
}
function Pv() {
  this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new be.Buf16(320), this.work = new be.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
}
function Uf(e) {
  var r;
  return !e || !e.state ? Oe : (r = e.state, e.total_in = e.total_out = r.total = 0, e.msg = "", r.wrap && (e.adler = r.wrap & 1), r.mode = Bf, r.last = 0, r.havedict = 0, r.dmax = 32768, r.head = null, r.hold = 0, r.bits = 0, r.lencode = r.lendyn = new be.Buf32(Cv), r.distcode = r.distdyn = new be.Buf32(Nv), r.sane = 1, r.back = -1, gt);
}
function zf(e) {
  var r;
  return !e || !e.state ? Oe : (r = e.state, r.wsize = 0, r.whave = 0, r.wnext = 0, Uf(e));
}
function Gf(e, r) {
  var t, i;
  return !e || !e.state || (i = e.state, r < 0 ? (t = 0, r = -r) : (t = (r >> 4) + 1, r < 48 && (r &= 15)), r && (r < 8 || r > 15)) ? Oe : (i.window !== null && i.wbits !== r && (i.window = null), i.wrap = t, i.wbits = r, zf(e));
}
function Zf(e, r) {
  var t, i;
  return e ? (i = new Pv(), e.state = i, i.window = null, t = Gf(e, r), t !== gt && (e.state = null), t) : Oe;
}
function jv(e) {
  return Zf(e, Dv);
}
var vo = !0, ln, un;
function Fv(e) {
  if (vo) {
    var r;
    for (ln = new be.Buf32(512), un = new be.Buf32(32), r = 0; r < 144; )
      e.lens[r++] = 8;
    for (; r < 256; )
      e.lens[r++] = 9;
    for (; r < 280; )
      e.lens[r++] = 7;
    for (; r < 288; )
      e.lens[r++] = 8;
    for (Qt(Df, e.lens, 0, 288, ln, 0, e.work, { bits: 9 }), r = 0; r < 32; )
      e.lens[r++] = 5;
    Qt(Pf, e.lens, 0, 32, un, 0, e.work, { bits: 5 }), vo = !1;
  }
  e.lencode = ln, e.lenbits = 9, e.distcode = un, e.distbits = 5;
}
function Wf(e, r, t, i) {
  var n, a = e.state;
  return a.window === null && (a.wsize = 1 << a.wbits, a.wnext = 0, a.whave = 0, a.window = new be.Buf8(a.wsize)), i >= a.wsize ? (be.arraySet(a.window, r, t - a.wsize, a.wsize, 0), a.wnext = 0, a.whave = a.wsize) : (n = a.wsize - a.wnext, n > i && (n = i), be.arraySet(a.window, r, t - i, n, a.wnext), i -= n, i ? (be.arraySet(a.window, r, t - i, i, 0), a.wnext = i, a.whave = a.wsize) : (a.wnext += n, a.wnext === a.wsize && (a.wnext = 0), a.whave < a.wsize && (a.whave += n))), 0;
}
function Bv(e, r) {
  var t, i, n, a, s, f, c, o, d, m, u, h, p, v, x = 0, l, _, R, g, E, $, A, T, b = new be.Buf8(4), I, O, L = (
    /* permutation of code lengths */
    [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
  );
  if (!e || !e.state || !e.output || !e.input && e.avail_in !== 0)
    return Oe;
  t = e.state, t.mode === Xe && (t.mode = sn), s = e.next_out, n = e.output, c = e.avail_out, a = e.next_in, i = e.input, f = e.avail_in, o = t.hold, d = t.bits, m = f, u = c, T = gt;
  e:
    for (; ; )
      switch (t.mode) {
        case Bf:
          if (t.wrap === 0) {
            t.mode = sn;
            break;
          }
          for (; d < 16; ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          if (t.wrap & 2 && o === 35615) {
            t.check = 0, b[0] = o & 255, b[1] = o >>> 8 & 255, t.check = Be(t.check, b, 2, 0), o = 0, d = 0, t.mode = Ws;
            break;
          }
          if (t.flags = 0, t.head && (t.head.done = !1), !(t.wrap & 1) || /* check if zlib header allowed */
          (((o & 255) << 8) + (o >> 8)) % 31) {
            e.msg = "incorrect header check", t.mode = fe;
            break;
          }
          if ((o & 15) !== Zs) {
            e.msg = "unknown compression method", t.mode = fe;
            break;
          }
          if (o >>>= 4, d -= 4, A = (o & 15) + 8, t.wbits === 0)
            t.wbits = A;
          else if (A > t.wbits) {
            e.msg = "invalid window size", t.mode = fe;
            break;
          }
          t.dmax = 1 << A, e.adler = t.check = 1, t.mode = o & 512 ? Qs : Xe, o = 0, d = 0;
          break;
        case Ws:
          for (; d < 16; ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          if (t.flags = o, (t.flags & 255) !== Zs) {
            e.msg = "unknown compression method", t.mode = fe;
            break;
          }
          if (t.flags & 57344) {
            e.msg = "unknown header flags set", t.mode = fe;
            break;
          }
          t.head && (t.head.text = o >> 8 & 1), t.flags & 512 && (b[0] = o & 255, b[1] = o >>> 8 & 255, t.check = Be(t.check, b, 2, 0)), o = 0, d = 0, t.mode = qs;
        case qs:
          for (; d < 32; ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          t.head && (t.head.time = o), t.flags & 512 && (b[0] = o & 255, b[1] = o >>> 8 & 255, b[2] = o >>> 16 & 255, b[3] = o >>> 24 & 255, t.check = Be(t.check, b, 4, 0)), o = 0, d = 0, t.mode = Hs;
        case Hs:
          for (; d < 16; ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          t.head && (t.head.xflags = o & 255, t.head.os = o >> 8), t.flags & 512 && (b[0] = o & 255, b[1] = o >>> 8 & 255, t.check = Be(t.check, b, 2, 0)), o = 0, d = 0, t.mode = Vs;
        case Vs:
          if (t.flags & 1024) {
            for (; d < 16; ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            t.length = o, t.head && (t.head.extra_len = o), t.flags & 512 && (b[0] = o & 255, b[1] = o >>> 8 & 255, t.check = Be(t.check, b, 2, 0)), o = 0, d = 0;
          } else t.head && (t.head.extra = null);
          t.mode = Xs;
        case Xs:
          if (t.flags & 1024 && (h = t.length, h > f && (h = f), h && (t.head && (A = t.head.extra_len - t.length, t.head.extra || (t.head.extra = new Array(t.head.extra_len)), be.arraySet(
            t.head.extra,
            i,
            a,
            // extra field is limited to 65536 bytes
            // - no need for additional size check
            h,
            /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
            A
          )), t.flags & 512 && (t.check = Be(t.check, i, h, a)), f -= h, a += h, t.length -= h), t.length))
            break e;
          t.length = 0, t.mode = Ys;
        case Ys:
          if (t.flags & 2048) {
            if (f === 0)
              break e;
            h = 0;
            do
              A = i[a + h++], t.head && A && t.length < 65536 && (t.head.name += String.fromCharCode(A));
            while (A && h < f);
            if (t.flags & 512 && (t.check = Be(t.check, i, h, a)), f -= h, a += h, A)
              break e;
          } else t.head && (t.head.name = null);
          t.length = 0, t.mode = Ks;
        case Ks:
          if (t.flags & 4096) {
            if (f === 0)
              break e;
            h = 0;
            do
              A = i[a + h++], t.head && A && t.length < 65536 && (t.head.comment += String.fromCharCode(A));
            while (A && h < f);
            if (t.flags & 512 && (t.check = Be(t.check, i, h, a)), f -= h, a += h, A)
              break e;
          } else t.head && (t.head.comment = null);
          t.mode = Js;
        case Js:
          if (t.flags & 512) {
            for (; d < 16; ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            if (o !== (t.check & 65535)) {
              e.msg = "header crc mismatch", t.mode = fe;
              break;
            }
            o = 0, d = 0;
          }
          t.head && (t.head.hcrc = t.flags >> 9 & 1, t.head.done = !0), e.adler = t.check = 0, t.mode = Xe;
          break;
        case Qs:
          for (; d < 32; ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          e.adler = t.check = ho(o), o = 0, d = 0, t.mode = Yr;
        case Yr:
          if (t.havedict === 0)
            return e.next_out = s, e.avail_out = c, e.next_in = a, e.avail_in = f, t.hold = o, t.bits = d, Av;
          e.adler = t.check = 1, t.mode = Xe;
        case Xe:
          if (r === Ov || r === Nr)
            break e;
        case sn:
          if (t.last) {
            o >>>= d & 7, d -= d & 7, t.mode = fn;
            break;
          }
          for (; d < 3; ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          switch (t.last = o & 1, o >>>= 1, d -= 1, o & 3) {
            case 0:
              t.mode = eo;
              break;
            case 1:
              if (Fv(t), t.mode = Lr, r === Nr) {
                o >>>= 2, d -= 2;
                break e;
              }
              break;
            case 2:
              t.mode = ro;
              break;
            case 3:
              e.msg = "invalid block type", t.mode = fe;
          }
          o >>>= 2, d -= 2;
          break;
        case eo:
          for (o >>>= d & 7, d -= d & 7; d < 32; ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          if ((o & 65535) !== (o >>> 16 ^ 65535)) {
            e.msg = "invalid stored block lengths", t.mode = fe;
            break;
          }
          if (t.length = o & 65535, o = 0, d = 0, t.mode = on, r === Nr)
            break e;
        case on:
          t.mode = to;
        case to:
          if (h = t.length, h) {
            if (h > f && (h = f), h > c && (h = c), h === 0)
              break e;
            be.arraySet(n, i, a, h, s), f -= h, a += h, c -= h, s += h, t.length -= h;
            break;
          }
          t.mode = Xe;
          break;
        case ro:
          for (; d < 14; ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          if (t.nlen = (o & 31) + 257, o >>>= 5, d -= 5, t.ndist = (o & 31) + 1, o >>>= 5, d -= 5, t.ncode = (o & 15) + 4, o >>>= 4, d -= 4, t.nlen > 286 || t.ndist > 30) {
            e.msg = "too many length or distance symbols", t.mode = fe;
            break;
          }
          t.have = 0, t.mode = io;
        case io:
          for (; t.have < t.ncode; ) {
            for (; d < 3; ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            t.lens[L[t.have++]] = o & 7, o >>>= 3, d -= 3;
          }
          for (; t.have < 19; )
            t.lens[L[t.have++]] = 0;
          if (t.lencode = t.lendyn, t.lenbits = 7, I = { bits: t.lenbits }, T = Qt(Rv, t.lens, 0, 19, t.lencode, 0, t.work, I), t.lenbits = I.bits, T) {
            e.msg = "invalid code lengths set", t.mode = fe;
            break;
          }
          t.have = 0, t.mode = no;
        case no:
          for (; t.have < t.nlen + t.ndist; ) {
            for (; x = t.lencode[o & (1 << t.lenbits) - 1], l = x >>> 24, _ = x >>> 16 & 255, R = x & 65535, !(l <= d); ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            if (R < 16)
              o >>>= l, d -= l, t.lens[t.have++] = R;
            else {
              if (R === 16) {
                for (O = l + 2; d < O; ) {
                  if (f === 0)
                    break e;
                  f--, o += i[a++] << d, d += 8;
                }
                if (o >>>= l, d -= l, t.have === 0) {
                  e.msg = "invalid bit length repeat", t.mode = fe;
                  break;
                }
                A = t.lens[t.have - 1], h = 3 + (o & 3), o >>>= 2, d -= 2;
              } else if (R === 17) {
                for (O = l + 3; d < O; ) {
                  if (f === 0)
                    break e;
                  f--, o += i[a++] << d, d += 8;
                }
                o >>>= l, d -= l, A = 0, h = 3 + (o & 7), o >>>= 3, d -= 3;
              } else {
                for (O = l + 7; d < O; ) {
                  if (f === 0)
                    break e;
                  f--, o += i[a++] << d, d += 8;
                }
                o >>>= l, d -= l, A = 0, h = 11 + (o & 127), o >>>= 7, d -= 7;
              }
              if (t.have + h > t.nlen + t.ndist) {
                e.msg = "invalid bit length repeat", t.mode = fe;
                break;
              }
              for (; h--; )
                t.lens[t.have++] = A;
            }
          }
          if (t.mode === fe)
            break;
          if (t.lens[256] === 0) {
            e.msg = "invalid code -- missing end-of-block", t.mode = fe;
            break;
          }
          if (t.lenbits = 9, I = { bits: t.lenbits }, T = Qt(Df, t.lens, 0, t.nlen, t.lencode, 0, t.work, I), t.lenbits = I.bits, T) {
            e.msg = "invalid literal/lengths set", t.mode = fe;
            break;
          }
          if (t.distbits = 6, t.distcode = t.distdyn, I = { bits: t.distbits }, T = Qt(Pf, t.lens, t.nlen, t.ndist, t.distcode, 0, t.work, I), t.distbits = I.bits, T) {
            e.msg = "invalid distances set", t.mode = fe;
            break;
          }
          if (t.mode = Lr, r === Nr)
            break e;
        case Lr:
          t.mode = Dr;
        case Dr:
          if (f >= 6 && c >= 258) {
            e.next_out = s, e.avail_out = c, e.next_in = a, e.avail_in = f, t.hold = o, t.bits = d, xv(e, u), s = e.next_out, n = e.output, c = e.avail_out, a = e.next_in, i = e.input, f = e.avail_in, o = t.hold, d = t.bits, t.mode === Xe && (t.back = -1);
            break;
          }
          for (t.back = 0; x = t.lencode[o & (1 << t.lenbits) - 1], l = x >>> 24, _ = x >>> 16 & 255, R = x & 65535, !(l <= d); ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          if (_ && !(_ & 240)) {
            for (g = l, E = _, $ = R; x = t.lencode[$ + ((o & (1 << g + E) - 1) >> g)], l = x >>> 24, _ = x >>> 16 & 255, R = x & 65535, !(g + l <= d); ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            o >>>= g, d -= g, t.back += g;
          }
          if (o >>>= l, d -= l, t.back += l, t.length = R, _ === 0) {
            t.mode = lo;
            break;
          }
          if (_ & 32) {
            t.back = -1, t.mode = Xe;
            break;
          }
          if (_ & 64) {
            e.msg = "invalid literal/length code", t.mode = fe;
            break;
          }
          t.extra = _ & 15, t.mode = ao;
        case ao:
          if (t.extra) {
            for (O = t.extra; d < O; ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            t.length += o & (1 << t.extra) - 1, o >>>= t.extra, d -= t.extra, t.back += t.extra;
          }
          t.was = t.length, t.mode = so;
        case so:
          for (; x = t.distcode[o & (1 << t.distbits) - 1], l = x >>> 24, _ = x >>> 16 & 255, R = x & 65535, !(l <= d); ) {
            if (f === 0)
              break e;
            f--, o += i[a++] << d, d += 8;
          }
          if (!(_ & 240)) {
            for (g = l, E = _, $ = R; x = t.distcode[$ + ((o & (1 << g + E) - 1) >> g)], l = x >>> 24, _ = x >>> 16 & 255, R = x & 65535, !(g + l <= d); ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            o >>>= g, d -= g, t.back += g;
          }
          if (o >>>= l, d -= l, t.back += l, _ & 64) {
            e.msg = "invalid distance code", t.mode = fe;
            break;
          }
          t.offset = R, t.extra = _ & 15, t.mode = oo;
        case oo:
          if (t.extra) {
            for (O = t.extra; d < O; ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            t.offset += o & (1 << t.extra) - 1, o >>>= t.extra, d -= t.extra, t.back += t.extra;
          }
          if (t.offset > t.dmax) {
            e.msg = "invalid distance too far back", t.mode = fe;
            break;
          }
          t.mode = fo;
        case fo:
          if (c === 0)
            break e;
          if (h = u - c, t.offset > h) {
            if (h = t.offset - h, h > t.whave && t.sane) {
              e.msg = "invalid distance too far back", t.mode = fe;
              break;
            }
            h > t.wnext ? (h -= t.wnext, p = t.wsize - h) : p = t.wnext - h, h > t.length && (h = t.length), v = t.window;
          } else
            v = n, p = s - t.offset, h = t.length;
          h > c && (h = c), c -= h, t.length -= h;
          do
            n[s++] = v[p++];
          while (--h);
          t.length === 0 && (t.mode = Dr);
          break;
        case lo:
          if (c === 0)
            break e;
          n[s++] = t.length, c--, t.mode = Dr;
          break;
        case fn:
          if (t.wrap) {
            for (; d < 32; ) {
              if (f === 0)
                break e;
              f--, o |= i[a++] << d, d += 8;
            }
            if (u -= c, e.total_out += u, t.total += u, u && (e.adler = t.check = /*UPDATE(state.check, put - _out, _out);*/
            t.flags ? Be(t.check, n, u, s - u) : Rn(t.check, n, u, s - u)), u = c, (t.flags ? o : ho(o)) !== t.check) {
              e.msg = "incorrect data check", t.mode = fe;
              break;
            }
            o = 0, d = 0;
          }
          t.mode = uo;
        case uo:
          if (t.wrap && t.flags) {
            for (; d < 32; ) {
              if (f === 0)
                break e;
              f--, o += i[a++] << d, d += 8;
            }
            if (o !== (t.total & 4294967295)) {
              e.msg = "incorrect length check", t.mode = fe;
              break;
            }
            o = 0, d = 0;
          }
          t.mode = co;
        case co:
          T = Tv;
          break e;
        case fe:
          T = jf;
          break e;
        case Mf:
          return Ff;
        case Iv:
        default:
          return Oe;
      }
  return e.next_out = s, e.avail_out = c, e.next_in = a, e.avail_in = f, t.hold = o, t.bits = d, (t.wsize || u !== e.avail_out && t.mode < fe && (t.mode < fn || r !== Gs)) && Wf(e, e.output, e.next_out, u - e.avail_out), m -= e.avail_in, u -= e.avail_out, e.total_in += m, e.total_out += u, t.total += u, t.wrap && u && (e.adler = t.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
  t.flags ? Be(t.check, n, u, e.next_out - u) : Rn(t.check, n, u, e.next_out - u)), e.data_type = t.bits + (t.last ? 64 : 0) + (t.mode === Xe ? 128 : 0) + (t.mode === Lr || t.mode === on ? 256 : 0), (m === 0 && u === 0 || r === Gs) && T === gt && (T = $v), T;
}
function Mv(e) {
  if (!e || !e.state)
    return Oe;
  var r = e.state;
  return r.window && (r.window = null), e.state = null, gt;
}
function Uv(e, r) {
  var t;
  return !e || !e.state || (t = e.state, !(t.wrap & 2)) ? Oe : (t.head = r, r.done = !1, gt);
}
function zv(e, r) {
  var t = r.length, i, n, a;
  return !e || !e.state || (i = e.state, i.wrap !== 0 && i.mode !== Yr) ? Oe : i.mode === Yr && (n = 1, n = Rn(n, r, t, 0), n !== i.check) ? jf : (a = Wf(e, r, t, t), a ? (i.mode = Mf, Ff) : (i.havedict = 1, gt));
}
De.inflateReset = zf;
De.inflateReset2 = Gf;
De.inflateResetKeep = Uf;
De.inflateInit = jv;
De.inflateInit2 = Zf;
De.inflate = Bv;
De.inflateEnd = Mv;
De.inflateGetHeader = Uv;
De.inflateSetDictionary = zv;
De.inflateInfo = "pako inflate (from Nodeca project)";
var qf = {
  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR: -5,
  //Z_VERSION_ERROR: -6,
  /* compression levels */
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY: 0,
  Z_TEXT: 1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN: 2,
  /* The deflate compression method */
  Z_DEFLATED: 8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};
function Gv() {
  this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
}
var Zv = Gv, It = De, er = Qe, Wr = wt, ce = qf, On = ia, Wv = Nf, qv = Zv, Hf = Object.prototype.toString;
function mt(e) {
  if (!(this instanceof mt)) return new mt(e);
  this.options = er.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ""
  }, e || {});
  var r = this.options;
  r.raw && r.windowBits >= 0 && r.windowBits < 16 && (r.windowBits = -r.windowBits, r.windowBits === 0 && (r.windowBits = -15)), r.windowBits >= 0 && r.windowBits < 16 && !(e && e.windowBits) && (r.windowBits += 32), r.windowBits > 15 && r.windowBits < 48 && (r.windowBits & 15 || (r.windowBits |= 15)), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new Wv(), this.strm.avail_out = 0;
  var t = It.inflateInit2(
    this.strm,
    r.windowBits
  );
  if (t !== ce.Z_OK)
    throw new Error(On[t]);
  if (this.header = new qv(), It.inflateGetHeader(this.strm, this.header), r.dictionary && (typeof r.dictionary == "string" ? r.dictionary = Wr.string2buf(r.dictionary) : Hf.call(r.dictionary) === "[object ArrayBuffer]" && (r.dictionary = new Uint8Array(r.dictionary)), r.raw && (t = It.inflateSetDictionary(this.strm, r.dictionary), t !== ce.Z_OK)))
    throw new Error(On[t]);
}
mt.prototype.push = function(e, r) {
  var t = this.strm, i = this.options.chunkSize, n = this.options.dictionary, a, s, f, c, o, d = !1;
  if (this.ended)
    return !1;
  s = r === ~~r ? r : r === !0 ? ce.Z_FINISH : ce.Z_NO_FLUSH, typeof e == "string" ? t.input = Wr.binstring2buf(e) : Hf.call(e) === "[object ArrayBuffer]" ? t.input = new Uint8Array(e) : t.input = e, t.next_in = 0, t.avail_in = t.input.length;
  do {
    if (t.avail_out === 0 && (t.output = new er.Buf8(i), t.next_out = 0, t.avail_out = i), a = It.inflate(t, ce.Z_NO_FLUSH), a === ce.Z_NEED_DICT && n && (a = It.inflateSetDictionary(this.strm, n)), a === ce.Z_BUF_ERROR && d === !0 && (a = ce.Z_OK, d = !1), a !== ce.Z_STREAM_END && a !== ce.Z_OK)
      return this.onEnd(a), this.ended = !0, !1;
    t.next_out && (t.avail_out === 0 || a === ce.Z_STREAM_END || t.avail_in === 0 && (s === ce.Z_FINISH || s === ce.Z_SYNC_FLUSH)) && (this.options.to === "string" ? (f = Wr.utf8border(t.output, t.next_out), c = t.next_out - f, o = Wr.buf2string(t.output, f), t.next_out = c, t.avail_out = i - c, c && er.arraySet(t.output, t.output, f, c, 0), this.onData(o)) : this.onData(er.shrinkBuf(t.output, t.next_out))), t.avail_in === 0 && t.avail_out === 0 && (d = !0);
  } while ((t.avail_in > 0 || t.avail_out === 0) && a !== ce.Z_STREAM_END);
  return a === ce.Z_STREAM_END && (s = ce.Z_FINISH), s === ce.Z_FINISH ? (a = It.inflateEnd(this.strm), this.onEnd(a), this.ended = !0, a === ce.Z_OK) : (s === ce.Z_SYNC_FLUSH && (this.onEnd(ce.Z_OK), t.avail_out = 0), !0);
};
mt.prototype.onData = function(e) {
  this.chunks.push(e);
};
mt.prototype.onEnd = function(e) {
  e === ce.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = er.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg;
};
function aa(e, r) {
  var t = new mt(r);
  if (t.push(e, !0), t.err)
    throw t.msg || On[t.err];
  return t.result;
}
function Hv(e, r) {
  return r = r || {}, r.raw = !0, aa(e, r);
}
_r.Inflate = mt;
_r.inflate = aa;
_r.inflateRaw = Hv;
_r.ungzip = aa;
var Vv = Qe.assign, Xv = dr, Yv = _r, Kv = qf, Vf = {};
Vv(Vf, Xv, Yv, Kv);
var Jv = Vf, Qv = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Uint32Array < "u", ep = Jv, Xf = ue(), pi = Te, tp = Qv ? "uint8array" : "array";
ci.magic = "\b\0";
function Et(e, r) {
  pi.call(this, "FlateWorker/" + e), this._pako = null, this._pakoAction = e, this._pakoOptions = r, this.meta = {};
}
Xf.inherits(Et, pi);
Et.prototype.processChunk = function(e) {
  this.meta = e.meta, this._pako === null && this._createPako(), this._pako.push(Xf.transformTo(tp, e.data), !1);
};
Et.prototype.flush = function() {
  pi.prototype.flush.call(this), this._pako === null && this._createPako(), this._pako.push([], !0);
};
Et.prototype.cleanUp = function() {
  pi.prototype.cleanUp.call(this), this._pako = null;
};
Et.prototype._createPako = function() {
  this._pako = new ep[this._pakoAction]({
    raw: !0,
    level: this._pakoOptions.level || -1
    // default compression
  });
  var e = this;
  this._pako.onData = function(r) {
    e.push({
      data: r,
      meta: e.meta
    });
  };
};
ci.compressWorker = function(e) {
  return new Et("Deflate", e);
};
ci.uncompressWorker = function() {
  return new Et("Inflate", {});
};
var po = Te;
ui.STORE = {
  magic: "\0\0",
  compressWorker: function() {
    return new po("STORE compression");
  },
  uncompressWorker: function() {
    return new po("STORE decompression");
  }
};
ui.DEFLATE = ci;
var ft = {};
ft.LOCAL_FILE_HEADER = "PK";
ft.CENTRAL_FILE_HEADER = "PK";
ft.CENTRAL_DIRECTORY_END = "PK";
ft.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07";
ft.ZIP64_CENTRAL_DIRECTORY_END = "PK";
ft.DATA_DESCRIPTOR = "PK\x07\b";
var Tt = ue(), zt = Te, cn = jt, _o = qn, Kr = ft, oe = function(e, r) {
  var t = "", i;
  for (i = 0; i < r; i++)
    t += String.fromCharCode(e & 255), e = e >>> 8;
  return t;
}, rp = function(e, r) {
  var t = e;
  return e || (t = r ? 16893 : 33204), (t & 65535) << 16;
}, ip = function(e) {
  return (e || 0) & 63;
}, Yf = function(e, r, t, i, n, a) {
  var s = e.file, f = e.compression, c = a !== cn.utf8encode, o = Tt.transformTo("string", a(s.name)), d = Tt.transformTo("string", cn.utf8encode(s.name)), m = s.comment, u = Tt.transformTo("string", a(m)), h = Tt.transformTo("string", cn.utf8encode(m)), p = d.length !== s.name.length, v = h.length !== m.length, x, l, _ = "", R = "", g = "", E = s.dir, $ = s.date, A = {
    crc32: 0,
    compressedSize: 0,
    uncompressedSize: 0
  };
  (!r || t) && (A.crc32 = e.crc32, A.compressedSize = e.compressedSize, A.uncompressedSize = e.uncompressedSize);
  var T = 0;
  r && (T |= 8), !c && (p || v) && (T |= 2048);
  var b = 0, I = 0;
  E && (b |= 16), n === "UNIX" ? (I = 798, b |= rp(s.unixPermissions, E)) : (I = 20, b |= ip(s.dosPermissions)), x = $.getUTCHours(), x = x << 6, x = x | $.getUTCMinutes(), x = x << 5, x = x | $.getUTCSeconds() / 2, l = $.getUTCFullYear() - 1980, l = l << 4, l = l | $.getUTCMonth() + 1, l = l << 5, l = l | $.getUTCDate(), p && (R = // Version
  oe(1, 1) + // NameCRC32
  oe(_o(o), 4) + // UnicodeName
  d, _ += // Info-ZIP Unicode Path Extra Field
  "up" + // size
  oe(R.length, 2) + // content
  R), v && (g = // Version
  oe(1, 1) + // CommentCRC32
  oe(_o(u), 4) + // UnicodeName
  h, _ += // Info-ZIP Unicode Path Extra Field
  "uc" + // size
  oe(g.length, 2) + // content
  g);
  var O = "";
  O += `
\0`, O += oe(T, 2), O += f.magic, O += oe(x, 2), O += oe(l, 2), O += oe(A.crc32, 4), O += oe(A.compressedSize, 4), O += oe(A.uncompressedSize, 4), O += oe(o.length, 2), O += oe(_.length, 2);
  var L = Kr.LOCAL_FILE_HEADER + O + o + _, B = Kr.CENTRAL_FILE_HEADER + // version made by (00: DOS)
  oe(I, 2) + // file header (common to file and central directory)
  O + // file comment length
  oe(u.length, 2) + // disk number start
  "\0\0\0\0" + // external file attributes
  oe(b, 4) + // relative offset of local header
  oe(i, 4) + // file name
  o + // extra field
  _ + // file comment
  u;
  return {
    fileRecord: L,
    dirRecord: B
  };
}, np = function(e, r, t, i, n) {
  var a = "", s = Tt.transformTo("string", n(i));
  return a = Kr.CENTRAL_DIRECTORY_END + // number of this disk
  "\0\0\0\0" + // total number of entries in the central directory on this disk
  oe(e, 2) + // total number of entries in the central directory
  oe(e, 2) + // size of the central directory   4 bytes
  oe(r, 4) + // offset of start of central directory with respect to the starting disk number
  oe(t, 4) + // .ZIP file comment length
  oe(s.length, 2) + // .ZIP file comment
  s, a;
}, ap = function(e) {
  var r = "";
  return r = Kr.DATA_DESCRIPTOR + // crc-32                          4 bytes
  oe(e.crc32, 4) + // compressed size                 4 bytes
  oe(e.compressedSize, 4) + // uncompressed size               4 bytes
  oe(e.uncompressedSize, 4), r;
};
function Pe(e, r, t, i) {
  zt.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = r, this.zipPlatform = t, this.encodeFileName = i, this.streamFiles = e, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
}
Tt.inherits(Pe, zt);
Pe.prototype.push = function(e) {
  var r = e.meta.percent || 0, t = this.entriesCount, i = this._sources.length;
  this.accumulate ? this.contentBuffer.push(e) : (this.bytesWritten += e.data.length, zt.prototype.push.call(this, {
    data: e.data,
    meta: {
      currentFile: this.currentFile,
      percent: t ? (r + 100 * (t - i - 1)) / t : 100
    }
  }));
};
Pe.prototype.openedSource = function(e) {
  this.currentSourceOffset = this.bytesWritten, this.currentFile = e.file.name;
  var r = this.streamFiles && !e.file.dir;
  if (r) {
    var t = Yf(e, r, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
    this.push({
      data: t.fileRecord,
      meta: { percent: 0 }
    });
  } else
    this.accumulate = !0;
};
Pe.prototype.closedSource = function(e) {
  this.accumulate = !1;
  var r = this.streamFiles && !e.file.dir, t = Yf(e, r, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
  if (this.dirRecords.push(t.dirRecord), r)
    this.push({
      data: ap(e),
      meta: { percent: 100 }
    });
  else
    for (this.push({
      data: t.fileRecord,
      meta: { percent: 0 }
    }); this.contentBuffer.length; )
      this.push(this.contentBuffer.shift());
  this.currentFile = null;
};
Pe.prototype.flush = function() {
  for (var e = this.bytesWritten, r = 0; r < this.dirRecords.length; r++)
    this.push({
      data: this.dirRecords[r],
      meta: { percent: 100 }
    });
  var t = this.bytesWritten - e, i = np(this.dirRecords.length, t, e, this.zipComment, this.encodeFileName);
  this.push({
    data: i,
    meta: { percent: 100 }
  });
};
Pe.prototype.prepareNextSource = function() {
  this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
};
Pe.prototype.registerPrevious = function(e) {
  this._sources.push(e);
  var r = this;
  return e.on("data", function(t) {
    r.processChunk(t);
  }), e.on("end", function() {
    r.closedSource(r.previous.streamInfo), r._sources.length ? r.prepareNextSource() : r.end();
  }), e.on("error", function(t) {
    r.error(t);
  }), this;
};
Pe.prototype.resume = function() {
  if (!zt.prototype.resume.call(this))
    return !1;
  if (!this.previous && this._sources.length)
    return this.prepareNextSource(), !0;
  if (!this.previous && !this._sources.length && !this.generatedError)
    return this.end(), !0;
};
Pe.prototype.error = function(e) {
  var r = this._sources;
  if (!zt.prototype.error.call(this, e))
    return !1;
  for (var t = 0; t < r.length; t++)
    try {
      r[t].error(e);
    } catch {
    }
  return !0;
};
Pe.prototype.lock = function() {
  zt.prototype.lock.call(this);
  for (var e = this._sources, r = 0; r < e.length; r++)
    e[r].lock();
};
var sp = Pe, op = ui, fp = sp, lp = function(e, r) {
  var t = e || r, i = op[t];
  if (!i)
    throw new Error(t + " is not a valid compression method !");
  return i;
};
of.generateWorker = function(e, r, t) {
  var i = new fp(r.streamFiles, t, r.platform, r.encodeFileName), n = 0;
  try {
    e.forEach(function(a, s) {
      n++;
      var f = lp(s.options.compression, r.compression), c = s.options.compressionOptions || r.compressionOptions || {}, o = s.dir, d = s.date;
      s._compressWorker(f, c).withStreamInfo("file", {
        name: a,
        dir: o,
        date: d,
        comment: s.comment || "",
        unixPermissions: s.unixPermissions,
        dosPermissions: s.dosPermissions
      }).pipe(i);
    }), i.entriesCount = n;
  } catch (a) {
    i.error(a);
  }
  return i;
};
var up = ue(), _i = Te;
function gr(e, r) {
  _i.call(this, "Nodejs stream input adapter for " + e), this._upstreamEnded = !1, this._bindStream(r);
}
up.inherits(gr, _i);
gr.prototype._bindStream = function(e) {
  var r = this;
  this._stream = e, e.pause(), e.on("data", function(t) {
    r.push({
      data: t,
      meta: {
        percent: 0
      }
    });
  }).on("error", function(t) {
    r.isPaused ? this.generatedError = t : r.error(t);
  }).on("end", function() {
    r.isPaused ? r._upstreamEnded = !0 : r.end();
  });
};
gr.prototype.pause = function() {
  return _i.prototype.pause.call(this) ? (this._stream.pause(), !0) : !1;
};
gr.prototype.resume = function() {
  return _i.prototype.resume.call(this) ? (this._upstreamEnded ? this.end() : this._stream.resume(), !0) : !1;
};
var cp = gr, hp = jt, tr = ue(), Kf = Te, dp = tf, Jf = Ae, go = Kn, vp = sd, pp = of, mo = oi, _p = cp, Qf = function(e, r, t) {
  var i = tr.getTypeOf(r), n, a = tr.extend(t || {}, Jf);
  a.date = a.date || /* @__PURE__ */ new Date(), a.compression !== null && (a.compression = a.compression.toUpperCase()), typeof a.unixPermissions == "string" && (a.unixPermissions = parseInt(a.unixPermissions, 8)), a.unixPermissions && a.unixPermissions & 16384 && (a.dir = !0), a.dosPermissions && a.dosPermissions & 16 && (a.dir = !0), a.dir && (e = el(e)), a.createFolders && (n = gp(e)) && tl.call(this, n, !0);
  var s = i === "string" && a.binary === !1 && a.base64 === !1;
  (!t || typeof t.binary > "u") && (a.binary = !s);
  var f = r instanceof go && r.uncompressedSize === 0;
  (f || a.dir || !r || r.length === 0) && (a.base64 = !1, a.binary = !0, r = "", a.compression = "STORE", i = "string");
  var c = null;
  r instanceof go || r instanceof Kf ? c = r : mo.isNode && mo.isStream(r) ? c = new _p(e, r) : c = tr.prepareContent(e, r, a.binary, a.optimizedBinaryString, a.base64);
  var o = new vp(e, c, a);
  this.files[e] = o;
}, gp = function(e) {
  e.slice(-1) === "/" && (e = e.substring(0, e.length - 1));
  var r = e.lastIndexOf("/");
  return r > 0 ? e.substring(0, r) : "";
}, el = function(e) {
  return e.slice(-1) !== "/" && (e += "/"), e;
}, tl = function(e, r) {
  return r = typeof r < "u" ? r : Jf.createFolders, e = el(e), this.files[e] || Qf.call(this, e, null, {
    dir: !0,
    createFolders: r
  }), this.files[e];
};
function yo(e) {
  return Object.prototype.toString.call(e) === "[object RegExp]";
}
var mp = {
  /**
   * @see loadAsync
   */
  load: function() {
    throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
  },
  /**
   * Call a callback function for each entry at this folder level.
   * @param {Function} cb the callback function:
   * function (relativePath, file) {...}
   * It takes 2 arguments : the relative path and the file.
   */
  forEach: function(e) {
    var r, t, i;
    for (r in this.files)
      i = this.files[r], t = r.slice(this.root.length, r.length), t && r.slice(0, this.root.length) === this.root && e(t, i);
  },
  /**
   * Filter nested files/folders with the specified function.
   * @param {Function} search the predicate to use :
   * function (relativePath, file) {...}
   * It takes 2 arguments : the relative path and the file.
   * @return {Array} An array of matching elements.
   */
  filter: function(e) {
    var r = [];
    return this.forEach(function(t, i) {
      e(t, i) && r.push(i);
    }), r;
  },
  /**
   * Add a file to the zip file, or search a file.
   * @param   {string|RegExp} name The name of the file to add (if data is defined),
   * the name of the file to find (if no data) or a regex to match files.
   * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
   * @param   {Object} o     File options
   * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
   * a file (when searching by string) or an array of files (when searching by regex).
   */
  file: function(e, r, t) {
    if (arguments.length === 1)
      if (yo(e)) {
        var i = e;
        return this.filter(function(a, s) {
          return !s.dir && i.test(a);
        });
      } else {
        var n = this.files[this.root + e];
        return n && !n.dir ? n : null;
      }
    else
      e = this.root + e, Qf.call(this, e, r, t);
    return this;
  },
  /**
   * Add a directory to the zip file, or search.
   * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
   * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
   */
  folder: function(e) {
    if (!e)
      return this;
    if (yo(e))
      return this.filter(function(n, a) {
        return a.dir && e.test(n);
      });
    var r = this.root + e, t = tl.call(this, r), i = this.clone();
    return i.root = t.name, i;
  },
  /**
   * Delete a file, or a directory and all sub-files, from the zip
   * @param {string} name the name of the file to delete
   * @return {JSZip} this JSZip object
   */
  remove: function(e) {
    e = this.root + e;
    var r = this.files[e];
    if (r || (e.slice(-1) !== "/" && (e += "/"), r = this.files[e]), r && !r.dir)
      delete this.files[e];
    else
      for (var t = this.filter(function(n, a) {
        return a.name.slice(0, e.length) === e;
      }), i = 0; i < t.length; i++)
        delete this.files[t[i].name];
    return this;
  },
  /**
   * @deprecated This method has been removed in JSZip 3.0, please check the upgrade guide.
   */
  generate: function() {
    throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
  },
  /**
   * Generate the complete zip file as an internal stream.
   * @param {Object} options the options to generate the zip file :
   * - compression, "STORE" by default.
   * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
   * @return {StreamHelper} the streamed zip file.
   */
  generateInternalStream: function(e) {
    var r, t = {};
    try {
      if (t = tr.extend(e || {}, {
        streamFiles: !1,
        compression: "STORE",
        compressionOptions: null,
        type: "",
        platform: "DOS",
        comment: null,
        mimeType: "application/zip",
        encodeFileName: hp.utf8encode
      }), t.type = t.type.toLowerCase(), t.compression = t.compression.toUpperCase(), t.type === "binarystring" && (t.type = "string"), !t.type)
        throw new Error("No output type specified.");
      tr.checkSupport(t.type), (t.platform === "darwin" || t.platform === "freebsd" || t.platform === "linux" || t.platform === "sunos") && (t.platform = "UNIX"), t.platform === "win32" && (t.platform = "DOS");
      var i = t.comment || this.comment || "";
      r = pp.generateWorker(this, t, i);
    } catch (n) {
      r = new Kf("error"), r.error(n);
    }
    return new dp(r, t.type || "string", t.mimeType);
  },
  /**
   * Generate the complete zip file asynchronously.
   * @see generateInternalStream
   */
  generateAsync: function(e, r) {
    return this.generateInternalStream(e).accumulate(r);
  },
  /**
   * Generate the complete zip file asynchronously.
   * @see generateInternalStream
   */
  generateNodeStream: function(e, r) {
    return e = e || {}, e.type || (e.type = "nodebuffer"), this.generateInternalStream(e).toNodejsStream(r);
  }
}, yp = mp, wp = ue();
function rl(e) {
  this.data = e, this.length = e.length, this.index = 0, this.zero = 0;
}
rl.prototype = {
  /**
   * Check that the offset will not go too far.
   * @param {string} offset the additional offset to check.
   * @throws {Error} an Error if the offset is out of bounds.
   */
  checkOffset: function(e) {
    this.checkIndex(this.index + e);
  },
  /**
   * Check that the specified index will not be too far.
   * @param {string} newIndex the index to check.
   * @throws {Error} an Error if the index is out of bounds.
   */
  checkIndex: function(e) {
    if (this.length < this.zero + e || e < 0)
      throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e + "). Corrupted zip ?");
  },
  /**
   * Change the index.
   * @param {number} newIndex The new index.
   * @throws {Error} if the new index is out of the data.
   */
  setIndex: function(e) {
    this.checkIndex(e), this.index = e;
  },
  /**
   * Skip the next n bytes.
   * @param {number} n the number of bytes to skip.
   * @throws {Error} if the new index is out of the data.
   */
  skip: function(e) {
    this.setIndex(this.index + e);
  },
  /**
   * Get the byte at the specified index.
   * @param {number} i the index to use.
   * @return {number} a byte.
   */
  byteAt: function() {
  },
  /**
   * Get the next number with a given byte size.
   * @param {number} size the number of bytes to read.
   * @return {number} the corresponding number.
   */
  readInt: function(e) {
    var r = 0, t;
    for (this.checkOffset(e), t = this.index + e - 1; t >= this.index; t--)
      r = (r << 8) + this.byteAt(t);
    return this.index += e, r;
  },
  /**
   * Get the next string with a given byte size.
   * @param {number} size the number of bytes to read.
   * @return {string} the corresponding string.
   */
  readString: function(e) {
    return wp.transformTo("string", this.readData(e));
  },
  /**
   * Get raw data without conversion, <size> bytes.
   * @param {number} size the number of bytes to read.
   * @return {Object} the raw data, implementation specific.
   */
  readData: function() {
  },
  /**
   * Find the last occurrence of a zip signature (4 bytes).
   * @param {string} sig the signature to find.
   * @return {number} the index of the last occurrence, -1 if not found.
   */
  lastIndexOfSignature: function() {
  },
  /**
   * Read the signature (4 bytes) at the current position and compare it with sig.
   * @param {string} sig the expected signature
   * @return {boolean} true if the signature matches, false otherwise.
   */
  readAndCheckSignature: function() {
  },
  /**
   * Get the next date.
   * @return {Date} the date.
   */
  readDate: function() {
    var e = this.readInt(4);
    return new Date(Date.UTC(
      (e >> 25 & 127) + 1980,
      // year
      (e >> 21 & 15) - 1,
      // month
      e >> 16 & 31,
      // day
      e >> 11 & 31,
      // hour
      e >> 5 & 63,
      // minute
      (e & 31) << 1
    ));
  }
};
var il = rl, nl = il, Ep = ue();
function Gt(e) {
  nl.call(this, e);
  for (var r = 0; r < this.data.length; r++)
    e[r] = e[r] & 255;
}
Ep.inherits(Gt, nl);
Gt.prototype.byteAt = function(e) {
  return this.data[this.zero + e];
};
Gt.prototype.lastIndexOfSignature = function(e) {
  for (var r = e.charCodeAt(0), t = e.charCodeAt(1), i = e.charCodeAt(2), n = e.charCodeAt(3), a = this.length - 4; a >= 0; --a)
    if (this.data[a] === r && this.data[a + 1] === t && this.data[a + 2] === i && this.data[a + 3] === n)
      return a - this.zero;
  return -1;
};
Gt.prototype.readAndCheckSignature = function(e) {
  var r = e.charCodeAt(0), t = e.charCodeAt(1), i = e.charCodeAt(2), n = e.charCodeAt(3), a = this.readData(4);
  return r === a[0] && t === a[1] && i === a[2] && n === a[3];
};
Gt.prototype.readData = function(e) {
  if (this.checkOffset(e), e === 0)
    return [];
  var r = this.data.slice(this.zero + this.index, this.zero + this.index + e);
  return this.index += e, r;
};
var al = Gt, sl = il, bp = ue();
function Zt(e) {
  sl.call(this, e);
}
bp.inherits(Zt, sl);
Zt.prototype.byteAt = function(e) {
  return this.data.charCodeAt(this.zero + e);
};
Zt.prototype.lastIndexOfSignature = function(e) {
  return this.data.lastIndexOf(e) - this.zero;
};
Zt.prototype.readAndCheckSignature = function(e) {
  var r = this.readData(4);
  return e === r;
};
Zt.prototype.readData = function(e) {
  this.checkOffset(e);
  var r = this.data.slice(this.zero + this.index, this.zero + this.index + e);
  return this.index += e, r;
};
var Sp = Zt, ol = al, kp = ue();
function sa(e) {
  ol.call(this, e);
}
kp.inherits(sa, ol);
sa.prototype.readData = function(e) {
  if (this.checkOffset(e), e === 0)
    return new Uint8Array(0);
  var r = this.data.subarray(this.zero + this.index, this.zero + this.index + e);
  return this.index += e, r;
};
var fl = sa, ll = fl, xp = ue();
function oa(e) {
  ll.call(this, e);
}
xp.inherits(oa, ll);
oa.prototype.readData = function(e) {
  this.checkOffset(e);
  var r = this.data.slice(this.zero + this.index, this.zero + this.index + e);
  return this.index += e, r;
};
var Rp = oa, Pr = ue(), wo = he, Op = al, Tp = Sp, Ap = Rp, $p = fl, ul = function(e) {
  var r = Pr.getTypeOf(e);
  return Pr.checkSupport(r), r === "string" && !wo.uint8array ? new Tp(e) : r === "nodebuffer" ? new Ap(e) : wo.uint8array ? new $p(Pr.transformTo("uint8array", e)) : new Op(Pr.transformTo("array", e));
}, hn = ul, tt = ue(), Ip = Kn, Eo = qn, jr = jt, Fr = ui, Cp = he, Np = 0, Lp = 3, Dp = function(e) {
  for (var r in Fr)
    if (Object.prototype.hasOwnProperty.call(Fr, r) && Fr[r].magic === e)
      return Fr[r];
  return null;
};
function cl(e, r) {
  this.options = e, this.loadOptions = r;
}
cl.prototype = {
  /**
   * say if the file is encrypted.
   * @return {boolean} true if the file is encrypted, false otherwise.
   */
  isEncrypted: function() {
    return (this.bitFlag & 1) === 1;
  },
  /**
   * say if the file has utf-8 filename/comment.
   * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
   */
  useUTF8: function() {
    return (this.bitFlag & 2048) === 2048;
  },
  /**
   * Read the local part of a zip file and add the info in this object.
   * @param {DataReader} reader the reader to use.
   */
  readLocalPart: function(e) {
    var r, t;
    if (e.skip(22), this.fileNameLength = e.readInt(2), t = e.readInt(2), this.fileName = e.readData(this.fileNameLength), e.skip(t), this.compressedSize === -1 || this.uncompressedSize === -1)
      throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
    if (r = Dp(this.compressionMethod), r === null)
      throw new Error("Corrupted zip : compression " + tt.pretty(this.compressionMethod) + " unknown (inner file : " + tt.transformTo("string", this.fileName) + ")");
    this.decompressed = new Ip(this.compressedSize, this.uncompressedSize, this.crc32, r, e.readData(this.compressedSize));
  },
  /**
   * Read the central part of a zip file and add the info in this object.
   * @param {DataReader} reader the reader to use.
   */
  readCentralPart: function(e) {
    this.versionMadeBy = e.readInt(2), e.skip(2), this.bitFlag = e.readInt(2), this.compressionMethod = e.readString(2), this.date = e.readDate(), this.crc32 = e.readInt(4), this.compressedSize = e.readInt(4), this.uncompressedSize = e.readInt(4);
    var r = e.readInt(2);
    if (this.extraFieldsLength = e.readInt(2), this.fileCommentLength = e.readInt(2), this.diskNumberStart = e.readInt(2), this.internalFileAttributes = e.readInt(2), this.externalFileAttributes = e.readInt(4), this.localHeaderOffset = e.readInt(4), this.isEncrypted())
      throw new Error("Encrypted zip are not supported");
    e.skip(r), this.readExtraFields(e), this.parseZIP64ExtraField(e), this.fileComment = e.readData(this.fileCommentLength);
  },
  /**
   * Parse the external file attributes and get the unix/dos permissions.
   */
  processAttributes: function() {
    this.unixPermissions = null, this.dosPermissions = null;
    var e = this.versionMadeBy >> 8;
    this.dir = !!(this.externalFileAttributes & 16), e === Np && (this.dosPermissions = this.externalFileAttributes & 63), e === Lp && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), !this.dir && this.fileNameStr.slice(-1) === "/" && (this.dir = !0);
  },
  /**
   * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
   * @param {DataReader} reader the reader to use.
   */
  parseZIP64ExtraField: function() {
    if (this.extraFields[1]) {
      var e = hn(this.extraFields[1].value);
      this.uncompressedSize === tt.MAX_VALUE_32BITS && (this.uncompressedSize = e.readInt(8)), this.compressedSize === tt.MAX_VALUE_32BITS && (this.compressedSize = e.readInt(8)), this.localHeaderOffset === tt.MAX_VALUE_32BITS && (this.localHeaderOffset = e.readInt(8)), this.diskNumberStart === tt.MAX_VALUE_32BITS && (this.diskNumberStart = e.readInt(4));
    }
  },
  /**
   * Read the central part of a zip file and add the info in this object.
   * @param {DataReader} reader the reader to use.
   */
  readExtraFields: function(e) {
    var r = e.index + this.extraFieldsLength, t, i, n;
    for (this.extraFields || (this.extraFields = {}); e.index + 4 < r; )
      t = e.readInt(2), i = e.readInt(2), n = e.readData(i), this.extraFields[t] = {
        id: t,
        length: i,
        value: n
      };
    e.setIndex(r);
  },
  /**
   * Apply an UTF8 transformation if needed.
   */
  handleUTF8: function() {
    var e = Cp.uint8array ? "uint8array" : "array";
    if (this.useUTF8())
      this.fileNameStr = jr.utf8decode(this.fileName), this.fileCommentStr = jr.utf8decode(this.fileComment);
    else {
      var r = this.findExtraFieldUnicodePath();
      if (r !== null)
        this.fileNameStr = r;
      else {
        var t = tt.transformTo(e, this.fileName);
        this.fileNameStr = this.loadOptions.decodeFileName(t);
      }
      var i = this.findExtraFieldUnicodeComment();
      if (i !== null)
        this.fileCommentStr = i;
      else {
        var n = tt.transformTo(e, this.fileComment);
        this.fileCommentStr = this.loadOptions.decodeFileName(n);
      }
    }
  },
  /**
   * Find the unicode path declared in the extra field, if any.
   * @return {String} the unicode path, null otherwise.
   */
  findExtraFieldUnicodePath: function() {
    var e = this.extraFields[28789];
    if (e) {
      var r = hn(e.value);
      return r.readInt(1) !== 1 || Eo(this.fileName) !== r.readInt(4) ? null : jr.utf8decode(r.readData(e.length - 5));
    }
    return null;
  },
  /**
   * Find the unicode comment declared in the extra field, if any.
   * @return {String} the unicode comment, null otherwise.
   */
  findExtraFieldUnicodeComment: function() {
    var e = this.extraFields[25461];
    if (e) {
      var r = hn(e.value);
      return r.readInt(1) !== 1 || Eo(this.fileComment) !== r.readInt(4) ? null : jr.utf8decode(r.readData(e.length - 5));
    }
    return null;
  }
};
var Pp = cl, jp = ul, Ye = ue(), $e = ft, Fp = Pp, Bp = he;
function hl(e) {
  this.files = [], this.loadOptions = e;
}
hl.prototype = {
  /**
   * Check that the reader is on the specified signature.
   * @param {string} expectedSignature the expected signature.
   * @throws {Error} if it is an other signature.
   */
  checkSignature: function(e) {
    if (!this.reader.readAndCheckSignature(e)) {
      this.reader.index -= 4;
      var r = this.reader.readString(4);
      throw new Error("Corrupted zip or bug: unexpected signature (" + Ye.pretty(r) + ", expected " + Ye.pretty(e) + ")");
    }
  },
  /**
   * Check if the given signature is at the given index.
   * @param {number} askedIndex the index to check.
   * @param {string} expectedSignature the signature to expect.
   * @return {boolean} true if the signature is here, false otherwise.
   */
  isSignature: function(e, r) {
    var t = this.reader.index;
    this.reader.setIndex(e);
    var i = this.reader.readString(4), n = i === r;
    return this.reader.setIndex(t), n;
  },
  /**
   * Read the end of the central directory.
   */
  readBlockEndOfCentral: function() {
    this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
    var e = this.reader.readData(this.zipCommentLength), r = Bp.uint8array ? "uint8array" : "array", t = Ye.transformTo(r, e);
    this.zipComment = this.loadOptions.decodeFileName(t);
  },
  /**
   * Read the end of the Zip 64 central directory.
   * Not merged with the method readEndOfCentral :
   * The end of central can coexist with its Zip64 brother,
   * I don't want to read the wrong number of bytes !
   */
  readBlockZip64EndOfCentral: function() {
    this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
    for (var e = this.zip64EndOfCentralSize - 44, r = 0, t, i, n; r < e; )
      t = this.reader.readInt(2), i = this.reader.readInt(4), n = this.reader.readData(i), this.zip64ExtensibleData[t] = {
        id: t,
        length: i,
        value: n
      };
  },
  /**
   * Read the end of the Zip 64 central directory locator.
   */
  readBlockZip64EndOfCentralLocator: function() {
    if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), this.disksCount > 1)
      throw new Error("Multi-volumes zip are not supported");
  },
  /**
   * Read the local files, based on the offset read in the central part.
   */
  readLocalFiles: function() {
    var e, r;
    for (e = 0; e < this.files.length; e++)
      r = this.files[e], this.reader.setIndex(r.localHeaderOffset), this.checkSignature($e.LOCAL_FILE_HEADER), r.readLocalPart(this.reader), r.handleUTF8(), r.processAttributes();
  },
  /**
   * Read the central directory.
   */
  readCentralDir: function() {
    var e;
    for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature($e.CENTRAL_FILE_HEADER); )
      e = new Fp({
        zip64: this.zip64
      }, this.loadOptions), e.readCentralPart(this.reader), this.files.push(e);
    if (this.centralDirRecords !== this.files.length && this.centralDirRecords !== 0 && this.files.length === 0)
      throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
  },
  /**
   * Read the end of central directory.
   */
  readEndOfCentral: function() {
    var e = this.reader.lastIndexOfSignature($e.CENTRAL_DIRECTORY_END);
    if (e < 0) {
      var r = !this.isSignature(0, $e.LOCAL_FILE_HEADER);
      throw r ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
    }
    this.reader.setIndex(e);
    var t = e;
    if (this.checkSignature($e.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === Ye.MAX_VALUE_16BITS || this.diskWithCentralDirStart === Ye.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === Ye.MAX_VALUE_16BITS || this.centralDirRecords === Ye.MAX_VALUE_16BITS || this.centralDirSize === Ye.MAX_VALUE_32BITS || this.centralDirOffset === Ye.MAX_VALUE_32BITS) {
      if (this.zip64 = !0, e = this.reader.lastIndexOfSignature($e.ZIP64_CENTRAL_DIRECTORY_LOCATOR), e < 0)
        throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
      if (this.reader.setIndex(e), this.checkSignature($e.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, $e.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature($e.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0))
        throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
      this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature($e.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
    }
    var i = this.centralDirOffset + this.centralDirSize;
    this.zip64 && (i += 20, i += 12 + this.zip64EndOfCentralSize);
    var n = t - i;
    if (n > 0)
      this.isSignature(t, $e.CENTRAL_FILE_HEADER) || (this.reader.zero = n);
    else if (n < 0)
      throw new Error("Corrupted zip: missing " + Math.abs(n) + " bytes.");
  },
  prepareReader: function(e) {
    this.reader = jp(e);
  },
  /**
   * Read a zip file and create ZipEntries.
   * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
   */
  load: function(e) {
    this.prepareReader(e), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
  }
};
var Mp = hl, dn = ue(), qr = hr, Up = jt, zp = Mp, Gp = sf, bo = oi;
function Zp(e) {
  return new qr.Promise(function(r, t) {
    var i = e.decompressed.getContentWorker().pipe(new Gp());
    i.on("error", function(n) {
      t(n);
    }).on("end", function() {
      i.streamInfo.crc32 !== e.decompressed.crc32 ? t(new Error("Corrupted zip : CRC32 mismatch")) : r();
    }).resume();
  });
}
var Wp = function(e, r) {
  var t = this;
  return r = dn.extend(r || {}, {
    base64: !1,
    checkCRC32: !1,
    optimizedBinaryString: !1,
    createFolders: !1,
    decodeFileName: Up.utf8decode
  }), bo.isNode && bo.isStream(e) ? qr.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : dn.prepareContent("the loaded zip file", e, !0, r.optimizedBinaryString, r.base64).then(function(i) {
    var n = new zp(r);
    return n.load(i), n;
  }).then(function(n) {
    var a = [qr.Promise.resolve(n)], s = n.files;
    if (r.checkCRC32)
      for (var f = 0; f < s.length; f++)
        a.push(Zp(s[f]));
    return qr.Promise.all(a);
  }).then(function(n) {
    for (var a = n.shift(), s = a.files, f = 0; f < s.length; f++) {
      var c = s[f], o = c.fileNameStr, d = dn.resolve(c.fileNameStr);
      t.file(d, c.decompressed, {
        binary: !0,
        optimizedBinaryString: !0,
        date: c.date,
        dir: c.dir,
        comment: c.fileCommentStr.length ? c.fileCommentStr : null,
        unixPermissions: c.unixPermissions,
        dosPermissions: c.dosPermissions,
        createFolders: r.createFolders
      }), c.dir || (t.file(d).unsafeOriginalName = o);
    }
    return a.zipComment.length && (t.comment = a.zipComment), t;
  });
};
function Re() {
  if (!(this instanceof Re))
    return new Re();
  if (arguments.length)
    throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
  this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
    var e = new Re();
    for (var r in this)
      typeof this[r] != "function" && (e[r] = this[r]);
    return e;
  };
}
Re.prototype = yp;
Re.prototype.loadAsync = Wp;
Re.support = he;
Re.defaults = Ae;
Re.version = "3.10.1";
Re.loadAsync = function(e, r) {
  return new Re().loadAsync(e, r);
};
Re.external = hr;
var qp = Re, rr = pe, dl = Je, vl = parseInt("0777", 8), Hp = Ct.mkdirp = Ct.mkdirP = Ct;
function Ct(e, r, t, i) {
  typeof r == "function" ? (t = r, r = {}) : (!r || typeof r != "object") && (r = { mode: r });
  var n = r.mode, a = r.fs || dl;
  n === void 0 && (n = vl), i || (i = null);
  var s = t || /* istanbul ignore next */
  function() {
  };
  e = rr.resolve(e), a.mkdir(e, n, function(f) {
    if (!f)
      return i = i || e, s(null, i);
    switch (f.code) {
      case "ENOENT":
        if (rr.dirname(e) === e) return s(f);
        Ct(rr.dirname(e), r, function(c, o) {
          c ? s(c, o) : Ct(e, r, s, o);
        });
        break;
      default:
        a.stat(e, function(c, o) {
          c || !o.isDirectory() ? s(f, i) : s(null, i);
        });
        break;
    }
  });
}
Ct.sync = function e(r, t, i) {
  (!t || typeof t != "object") && (t = { mode: t });
  var n = t.mode, a = t.fs || dl;
  n === void 0 && (n = vl), i || (i = null), r = rr.resolve(r);
  try {
    a.mkdirSync(r, n), i = i || r;
  } catch (f) {
    switch (f.code) {
      case "ENOENT":
        i = e(rr.dirname(r), t, i), e(r, t, i);
        break;
      default:
        var s;
        try {
          s = a.statSync(r);
        } catch {
          throw f;
        }
        if (!s.isDirectory()) throw f;
        break;
    }
  }
  return i;
};
var pl = { exports: {} };
(function() {
  var e, r = null, t = typeof window == "object" ? window : ve, i = !1, n = t.process, a = Array, s = Error, f = 0, c = 1, o = 2, d = "Symbol", m = "iterator", u = "species", h = d + "(" + u + ")", p = "return", v = "_uh", x = "_pt", l = "_st", _ = "Invalid this", R = "Invalid argument", g = `
From previous `, E = "Chaining cycle detected for promise", $ = "Uncaught (in promise)", A = "rejectionHandled", T = "unhandledRejection", b, I, O = { e: r }, L = function() {
  }, B = /^.+\/node_modules\/yaku\/.+\n?/mg, N = pl.exports = function(F) {
    var z = this, q;
    if (!w(z) || z._s !== e)
      throw Y(_);
    if (z._s = o, i && (z[x] = y()), F !== L) {
      if (!S(F))
        throw Y(R);
      q = H(F)(
        K(z, c),
        K(z, f)
      ), q === O && se(z, f, q.e);
    }
  };
  N.default = N, G(N, {
    /**
     * Appends fulfillment and rejection handlers to the promise,
     * and returns a new promise resolving to the return value of the called handler.
     * @param  {Function} onFulfilled Optional. Called when the Promise is resolved.
     * @param  {Function} onRejected  Optional. Called when the Promise is rejected.
     * @return {Yaku} It will return a new Yaku which will resolve or reject after
     * @example
     * the current Promise.
     * ```js
     * var Promise = require('yaku');
     * var p = Promise.resolve(10);
     *
     * p.then((v) => {
     *     console.log(v);
     * });
     * ```
     */
    then: function(F, z) {
      if (this._s === void 0) throw Y();
      return Ee(
        this,
        V(N.speciesConstructor(this, N)),
        F,
        z
      );
    },
    /**
     * The `catch()` method returns a Promise and deals with rejected cases only.
     * It behaves the same as calling `Promise.prototype.then(undefined, onRejected)`.
     * @param  {Function} onRejected A Function called when the Promise is rejected.
     * This function has one argument, the rejection reason.
     * @return {Yaku} A Promise that deals with rejected cases only.
     * @example
     * ```js
     * var Promise = require('yaku');
     * var p = Promise.reject(new Error("ERR"));
     *
     * p['catch']((v) => {
     *     console.log(v);
     * });
     * ```
     */
    catch: function(D) {
      return this.then(e, D);
    },
    // The number of current promises that attach to this Yaku instance.
    _pCount: 0,
    // The parent Yaku.
    _pre: r,
    // A unique type flag, it helps different versions of Yaku know each other.
    _Yaku: 1
  }), N.resolve = function(F) {
    return ee(F) ? F : We(V(this), F);
  }, N.reject = function(F) {
    return se(V(this), f, F);
  }, N.race = function(F) {
    var z = this, q = V(z), ne = function(Se) {
      se(q, c, Se);
    }, ie = function(Se) {
      se(q, f, Se);
    }, je = H(Q)(F, function(Se) {
      z.resolve(Se).then(ne, ie);
    });
    return je === O ? z.reject(je.e) : q;
  }, N.all = function(F) {
    var z = this, q = V(z), ne = [], ie;
    function je(Se) {
      se(q, f, Se);
    }
    return ie = H(Q)(F, function(Se, Sl) {
      z.resolve(Se).then(function(kl) {
        ne[Sl] = kl, --ie || se(q, c, ne);
      }, je);
    }), ie === O ? z.reject(ie.e) : (ie || se(q, c, []), q);
  }, N.Symbol = t[d] || {}, H(function() {
    Object.defineProperty(N, P(), {
      get: function() {
        return this;
      }
    });
  })(), N.speciesConstructor = function(D, F) {
    var z = D.constructor;
    return z && z[P()] || F;
  }, N.unhandledRejection = function(D, F) {
    try {
      t.console.error(
        $,
        i ? F.longStack : lt(D, F)
      );
    } catch {
    }
  }, N.rejectionHandled = L, N.enableLongStackTrace = function() {
    i = !0;
  }, N.nextTick = n ? n.nextTick : function(D) {
    setTimeout(D);
  }, N._Yaku = 1;
  function P() {
    return N[d][u] || h;
  }
  function G(D, F) {
    for (var z in F)
      D.prototype[z] = F[z];
    return D;
  }
  function w(D) {
    return D && typeof D == "object";
  }
  function S(D) {
    return typeof D == "function";
  }
  function C(D, F) {
    return D instanceof F;
  }
  function j(D) {
    return C(D, s);
  }
  function U(D, F, z) {
    if (!F(D)) throw Y(z);
  }
  function Z() {
    try {
      return b.apply(I, arguments);
    } catch (D) {
      return O.e = D, O;
    }
  }
  function H(D, F) {
    return b = D, I = F, Z;
  }
  function X(D, F) {
    var z = a(D), q = 0;
    function ne() {
      for (var ie = 0; ie < q; )
        F(z[ie], z[ie + 1]), z[ie++] = e, z[ie++] = e;
      q = 0, z.length > D && (z.length = D);
    }
    return function(ie, je) {
      z[q++] = ie, z[q++] = je, q === 2 && N.nextTick(ne);
    };
  }
  function Q(D, F) {
    var z, q = 0, ne, ie, je;
    if (!D) throw Y(R);
    var Se = D[N[d][m]];
    if (S(Se))
      ne = Se.call(D);
    else if (S(D.next))
      ne = D;
    else if (C(D, a)) {
      for (z = D.length; q < z; )
        F(D[q], q++);
      return q;
    } else
      throw Y(R);
    for (; !(ie = ne.next()).done; )
      if (je = H(F)(ie.value, q++), je === O)
        throw S(ne[p]) && ne[p](), je.e;
    return q;
  }
  function Y(D) {
    return new TypeError(D);
  }
  function y(D) {
    return (D ? "" : g) + new s().stack;
  }
  var k = X(999, function(D, F) {
    var z, q;
    if (q = D._s ? F._onFulfilled : F._onRejected, q === e) {
      se(F, D._s, D._v);
      return;
    }
    if (z = H(bt)(q, D._v), z === O) {
      se(F, f, z.e);
      return;
    }
    We(F, z);
  }), M = X(9, function(D) {
    Ze(D) || (D[v] = 1, W(T, D));
  });
  function W(D, F) {
    var z = "on" + D.toLowerCase(), q = t[z];
    n && n.listeners(D).length ? D === T ? n.emit(D, F._v, F) : n.emit(D, F) : q ? q({ reason: F._v, promise: F }) : N[D](F._v, F);
  }
  function ee(D) {
    return D && D._Yaku;
  }
  function V(D) {
    if (ee(D)) return new D(L);
    var F, z, q;
    return F = new D(function(ne, ie) {
      if (F) throw Y();
      z = ne, q = ie;
    }), U(z, S), U(q, S), F;
  }
  function K(D, F) {
    return function(z) {
      i && (D[l] = y(!0)), F === c ? We(D, z) : se(D, F, z);
    };
  }
  function Ee(D, F, z, q) {
    return S(z) && (F._onFulfilled = z), S(q) && (D[v] && W(A, D), F._onRejected = q), i && (F._pre = D), D[D._pCount++] = F, D._s !== o && k(D, F), F;
  }
  function Ze(D) {
    if (D._umark)
      return !0;
    D._umark = !0;
    for (var F = 0, z = D._pCount, q; F < z; )
      if (q = D[F++], q._onRejected || Ze(q)) return !0;
  }
  function lt(D, F) {
    var z = [];
    function q(ne) {
      return z.push(ne.replace(/^\s+|\s+$/g, ""));
    }
    return i && (F[l] && q(F[l]), function ne(ie) {
      ie && x in ie && (ne(ie._next), q(ie[x] + ""), ne(ie._pre));
    }(F)), (D && D.stack ? D.stack : D) + (`
` + z.join(`
`)).replace(B, "");
  }
  function bt(D, F) {
    return D(F);
  }
  function se(D, F, z) {
    var q = 0, ne = D._pCount;
    if (D._s === o)
      for (D._s = F, D._v = z, F === f && (i && j(z) && (z.longStack = lt(z, D)), M(D)); q < ne; )
        k(D, D[q++]);
    return D;
  }
  function We(D, F) {
    if (F === D && F)
      return se(D, f, Y(E)), D;
    if (F !== r && (S(F) || w(F))) {
      var z = H(qe)(F);
      if (z === O)
        return se(D, f, z.e), D;
      S(z) ? (i && ee(F) && (D._next = F), ee(F) ? He(D, F, z) : N.nextTick(function() {
        He(D, F, z);
      })) : se(D, c, F);
    } else
      se(D, c, F);
    return D;
  }
  function qe(D) {
    return D.then;
  }
  function He(D, F, z) {
    var q = H(z, F)(function(ne) {
      F && (F = r, We(D, ne));
    }, function(ne) {
      F && (F = r, se(D, f, ne));
    });
    q === O && F && (se(D, f, q.e), F = r);
  }
})();
var Vp = pl.exports, Xp = Vp, Yp = {
  extendPrototype: function(e, r) {
    for (var t in r)
      e.prototype[t] = r[t];
    return e;
  },
  isFunction: function(e) {
    return typeof e == "function";
  },
  isNumber: function(e) {
    return typeof e == "number";
  },
  Promise: Xp,
  slice: [].slice
}, _l = Yp, Rt = _l.isFunction, Kp = function(e, r) {
  return function(t, i, n, a, s) {
    var f = arguments.length, c, o, d, m;
    o = new _l.Promise(function(p, v) {
      d = p, m = v;
    });
    function u(p, v) {
      p == null ? d(v) : m(p);
    }
    switch (f) {
      case 0:
        e.call(r, u);
        break;
      case 1:
        Rt(t) ? e.call(r, t) : e.call(r, t, u);
        break;
      case 2:
        Rt(i) ? e.call(r, t, i) : e.call(r, t, i, u);
        break;
      case 3:
        Rt(n) ? e.call(r, t, i, n) : e.call(r, t, i, n, u);
        break;
      case 4:
        Rt(a) ? e.call(r, t, i, n, a) : e.call(r, t, i, n, a, u);
        break;
      case 5:
        Rt(s) ? e.call(r, t, i, n, a, s) : e.call(r, t, i, n, a, s, u);
        break;
      default:
        c = new Array(f);
        for (var h = 0; h < f; h++)
          c[h] = arguments[h];
        if (Rt(c[f - 1]))
          return e.apply(r, c);
        c[h] = u, e.apply(r, c);
    }
    return o;
  };
}, gl = Je, ut = pe, Jp = qp, Qp = Hp, fa = Kp, e0 = fa(gl.writeFile), t0 = fa(gl.readFile), r0 = fa(Qp);
function i0(e) {
  function r(o, d, m, u) {
    var h = 0;
    return h += o, h += d << 8, h += m << 16, h += u << 24, h;
  }
  if (e[0] === 80 && e[1] === 75 && e[2] === 3 && e[3] === 4)
    return e;
  if (e[0] !== 67 || e[1] !== 114 || e[2] !== 50 || e[3] !== 52)
    throw new Error("Invalid header: Does not start with Cr24");
  var t = e[4] === 3, i = e[4] === 2;
  if (!i && !t || e[5] || e[6] || e[7])
    throw new Error("Unexpected crx format version number.");
  if (i) {
    var n = r(e[8], e[9], e[10], e[11]), a = r(e[12], e[13], e[14], e[15]), s = 16 + n + a;
    return e.slice(s, e.length);
  }
  var f = r(e[8], e[9], e[10], e[11]), c = 12 + f;
  return e.slice(c, e.length);
}
function n0(e, r) {
  var t = ut.resolve(e), i = ut.extname(e), n = ut.basename(e, i), a = ut.dirname(e);
  return r = r || ut.resolve(a, n), t0(t).then(function(s) {
    return Jp.loadAsync(i0(s));
  }).then(function(s) {
    var f = Object.keys(s.files);
    return Promise.all(f.map(function(c) {
      var o = !s.files[c].dir, d = ut.join(r, c), m = o && ut.dirname(d) || d, u = s.files[c].async("nodebuffer");
      return r0(m).then(function() {
        return o ? u : !1;
      }).then(function(h) {
        return h ? e0(d, h) : !0;
      });
    }));
  });
}
var a0 = n0;
Object.defineProperty(Mn, "__esModule", { value: !0 });
const Vt = Je, vn = pe, s0 = Ah, pn = Zn, o0 = a0, ml = (e, r, t = 5) => {
  const i = pn.getPath();
  Vt.existsSync(i) || Vt.mkdirSync(i, { recursive: !0 });
  const n = vn.resolve(`${i}/${e}`);
  return new Promise((a, s) => {
    if (!Vt.existsSync(n) || r) {
      Vt.existsSync(n) && s0.sync(n);
      const f = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id%3D${e}%26uc&prodversion=32`, c = vn.resolve(`${n}.crx`);
      pn.downloadFile(f, c).then(() => {
        o0(c, n).then(() => {
          pn.changePermissions(n, 755), a(n);
        }).catch((o) => {
          if (!Vt.existsSync(vn.resolve(n, "manifest.json")))
            return s(o);
        });
      }).catch((o) => {
        if (console.log(`Failed to fetch extension, trying ${t - 1} more times`), t <= 1)
          return s(o);
        setTimeout(() => {
          ml(e, r, t - 1).then(a).catch(s);
        }, 200);
      });
    } else
      a(n);
  });
};
Mn.default = ml;
Object.defineProperty(le, "__esModule", { value: !0 });
le.MOBX_DEVTOOLS = le.APOLLO_DEVELOPER_TOOLS = le.CYCLEJS_DEVTOOL = ua = le.REDUX_DEVTOOLS = le.VUEJS3_DEVTOOLS = le.VUEJS_DEVTOOLS = le.ANGULARJS_BATARANG = le.JQUERY_DEBUGGER = le.BACKBONE_DEBUGGER = la = le.REACT_DEVELOPER_TOOLS = le.EMBER_INSPECTOR = void 0;
const Ie = So, Tn = Je, f0 = pe, l0 = mh, u0 = Mn, c0 = Zn;
let Hr = {};
const An = () => f0.resolve(c0.getPath(), "IDMap.json");
if (Tn.existsSync(An()))
  try {
    Hr = JSON.parse(Tn.readFileSync(An(), "utf8"));
  } catch {
    console.error("electron-devtools-installer: Invalid JSON present in the IDMap file");
  }
const yl = (e, r = {}) => {
  typeof r == "boolean" && (r = { forceDownload: r });
  const { forceDownload: t, loadExtensionOptions: i } = r;
  if (process.type !== "browser")
    return Promise.reject(new Error("electron-devtools-installer can only be used from the main process"));
  if (Array.isArray(e))
    return e.reduce((f, c) => f.then(() => yl(c, r)), Promise.resolve(""));
  let n;
  if (typeof e == "object" && e.id) {
    n = e.id;
    const f = process.versions.electron.split("-")[0];
    if (!l0.satisfies(f, e.electron))
      return Promise.reject(new Error(`Version of Electron: ${f} does not match required range ${e.electron} for extension ${n}`));
  } else if (typeof e == "string")
    n = e;
  else
    return Promise.reject(new Error(`Invalid extensionReference passed in: "${e}"`));
  const a = Hr[n];
  let s;
  return Ie.session.defaultSession.getExtension ? s = !!a && Ie.session.defaultSession.getAllExtensions().find((f) => f.name === a) : s = !!a && Ie.BrowserWindow.getDevToolsExtensions && Ie.BrowserWindow.getDevToolsExtensions().hasOwnProperty(a), !t && s ? Promise.resolve(Hr[n]) : u0.default(n, t || !1).then((f) => {
    if (s)
      if (Ie.session.defaultSession.removeExtension) {
        const o = Ie.session.defaultSession.getAllExtensions().find((d) => d.name).id;
        Ie.session.defaultSession.removeExtension(o);
      } else
        Ie.BrowserWindow.removeDevToolsExtension(a);
    if (Ie.session.defaultSession.loadExtension)
      return Ie.session.defaultSession.loadExtension(f, i).then((o) => Promise.resolve(o.name));
    const c = Ie.BrowserWindow.addDevToolsExtension(f);
    return Tn.writeFileSync(An(), JSON.stringify(Object.assign(Hr, {
      [n]: c
    }))), Promise.resolve(c);
  });
};
var Jr = le.default = yl;
le.EMBER_INSPECTOR = {
  id: "bmdblncegkenkacieihfhpjfppoconhi",
  electron: ">=1.2.1"
};
var la = le.REACT_DEVELOPER_TOOLS = {
  id: "fmkadmapgofadopljbjfkapdkoienihi",
  electron: ">=1.2.1"
};
le.BACKBONE_DEBUGGER = {
  id: "bhljhndlimiafopmmhjlgfpnnchjjbhd",
  electron: ">=1.2.1"
};
le.JQUERY_DEBUGGER = {
  id: "dbhhnnnpaeobfddmlalhnehgclcmjimi",
  electron: ">=1.2.1"
};
le.ANGULARJS_BATARANG = {
  id: "ighdmehidhipcmcojjgiloacoafjmpfk",
  electron: ">=1.2.1"
};
le.VUEJS_DEVTOOLS = {
  id: "nhdogjmejiglipccpnnnanhbledajbpd",
  electron: ">=1.2.1"
};
le.VUEJS3_DEVTOOLS = {
  id: "ljjemllljcmogpfapbkkighbhhppjdbg",
  electron: ">=1.2.1"
};
var ua = le.REDUX_DEVTOOLS = {
  id: "lmhkpmbekcpmknklioeibfkpmmfibljd",
  electron: ">=1.2.1"
};
le.CYCLEJS_DEVTOOL = {
  id: "dfgplfmhhmdekalbpejekgfegkonjpfp",
  electron: ">=1.2.1"
};
le.APOLLO_DEVELOPER_TOOLS = {
  id: "jdkknkkbebbapilgoeccciglkfbmbnfm",
  electron: ">=1.2.1"
};
le.MOBX_DEVTOOLS = {
  id: "pfgnfdagidkfgccljigdamigbcnndkod",
  electron: ">=1.2.1"
};
const _n = process.env.NODE_ENV === "development", wl = pe.dirname(xl(import.meta.url)), ca = pe.join(wl, ".."), Vr = process.env.VITE_DEV_SERVER_URL;
pe.join(ca, "dist-electron");
const El = pe.join(ca, "dist"), h0 = Vr ? pe.join(ca, "public") : El;
let J = null;
function bl() {
  if (J = new ko({
    resizable: !0,
    movable: !0,
    icon: pe.join(h0, "favicon.png"),
    webPreferences: {
      preload: pe.join(wl, "preload.mjs"),
      devTools: _n
    }
  }), _n && (J.webContents.session.clearCache(), J.webContents.session.clearStorageData({
    storages: ["cachestorage", "filesystem", "indexdb", "localstorage", "shadercache", "websql", "serviceworkers"]
  })), J.webContents.on("did-finish-load", () => {
    J == null || J.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Vr) {
    J.loadURL(Vr);
    let t = 0;
    const i = 30;
    let n = null;
    const a = () => {
      n || (n = setInterval(() => {
        if (t >= i) {
          console.log("Max reload attempts reached, stopping polling"), n && clearInterval(n), n = null;
          return;
        }
        t++, console.log(`Checking if Vite server is back... (attempt ${t}/${i})`), fetch(Vr).then(() => {
          console.log("Vite server is back! Reloading..."), n && clearInterval(n), n = null, t = 0, J == null || J.reload();
        }).catch(() => {
        });
      }, 2e3));
    };
    J.webContents.on("did-fail-load", (s, f, c, o) => {
      console.log(`Failed to load URL: ${o}, Error: ${c} (${f})`), (f === -28 || f === -106 || f === -102 || f === -137 || f === -300) && (console.log("Connection error detected, starting reload polling..."), a());
    }), J.webContents.on("dom-ready", () => {
      console.log("DOM ready - Vite connection established"), t = 0, n && (clearInterval(n), n = null);
    });
  } else
    J.loadFile(pe.join(El, "index.html"));
  const e = [
    {
      label: "Developer Tools",
      submenu: [
        {
          label: "Toggle DevTools",
          accelerator: "CmdOrCtrl+I",
          click: () => J == null ? void 0 : J.webContents.toggleDevTools()
        },
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          role: "reload"
        },
        {
          label: "Hard Reload (No Cache)",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            J == null || J.webContents.reloadIgnoringCache();
          }
        },
        {
          label: "API Documentation",
          accelerator: "CmdOrCtrl+D",
          click: () => J == null ? void 0 : J.loadURL("http://127.0.0.1:8000/docs/api")
        }
      ]
    },
    {
      label: "Home",
      accelerator: "CmdOrCtrl+H",
      click: () => J == null ? void 0 : J.webContents.send("navigate-home")
    }
  ], r = ha.buildFromTemplate(e);
  ha.setApplicationMenu(r), J.maximize(), _n && J.webContents.once("dom-ready", async () => {
    try {
      const t = await Promise.all([
        Jr(ua),
        Jr(la)
      ]);
      console.log("Added Extensions: ", t.join(", "));
    } catch (t) {
      console.error("Failed to install extensions:", t);
    } finally {
      J == null || J.webContents.openDevTools();
    }
  });
}
ir.on("window-all-closed", () => {
  process.platform !== "darwin" && ir.quit();
});
ir.on("activate", () => {
  ko.getAllWindows().length === 0 && bl();
});
ir.whenReady().then(async () => {
  try {
    await Promise.all([
      Jr(ua),
      Jr(la)
    ]), console.log("Extensions installed successfully");
  } catch (e) {
    console.error("Failed to install extensions:", e);
  }
  bl();
});
Qr.handle("get-printers", async () => {
  try {
    if (!J) throw new Error("Main window not available");
    return { success: !0, printers: await J.webContents.getPrintersAsync() };
  } catch (e) {
    return console.error("Error getting printers:", e), { success: !1, error: e.message };
  }
});
Qr.handle("print-thermal", async (e, { printerName: r }) => {
  try {
    if (!J) throw new Error("Main window not available");
    return await J.webContents.print(
      {
        silent: !0,
        printBackground: !1,
        deviceName: r
      },
      (t, i) => {
        t || console.error("Print failed:", i);
      }
    ), { success: !0 };
  } catch (t) {
    return console.error("Error printing:", t), { success: !1, error: t.message };
  }
});
Qr.handle("print-thermal-raw", async (e, { printerName: r, escposData: t }) => {
  try {
    return console.log(`Raw print request for printer: ${r}`), console.log(`ESC/POS data length: ${t.length} bytes`), {
      success: !0,
      message: "Raw ESC/POS printing requires additional setup. Use HTML print method for now."
    };
  } catch (i) {
    return console.error("Error with raw printing:", i), { success: !1, error: i.message };
  }
});
ir.on("before-quit", () => {
  J == null || J.removeAllListeners(), Qr.removeAllListeners();
});
