import { expect, test } from "bun:test";
import { LibIds } from "./ids"

test("1000 random numbers with parse single", () => {
  for (let i = 0; i < 1000; i++) {
    const id = Math.floor(Math.random() * 64)
    const encoded = LibIds.stringify(id, 1)
    const decoded = LibIds.parseSingle(encoded)
    expect(decoded).toBe(id)
  }
})

test("1000 random numbers with normal parse and 1 digit", () => {
  for (let i = 0; i < 1000; i++) {
    const id = Math.floor(Math.random() * 64)
    const encoded = LibIds.stringify(id, 1)
    const decoded = LibIds.parse(encoded)
    expect(decoded).toBe(id)
  }
})

test("1000 random numbers with normal parse and 2 digits", () => {
  for (let i = 0; i < 1000; i++) {
    const id = Math.floor(Math.random() * 64 * 64)
    const encoded = LibIds.stringify(id, 2)
    const decoded = LibIds.parse(encoded)
    expect(decoded).toBe(id)
  }
})

test("1000 random numbers with normal parse and 3 digits", () => {
  for (let i = 0; i < 1000; i++) {
    const id = Math.floor(Math.random() * 64 * 64 * 64)
    const encoded = LibIds.stringify(id, 3)
    const decoded = LibIds.parse(encoded)
    expect(decoded).toBe(id)
  }
})

test("1000 random numbers with normal parse and 4 digits", () => {
  for (let i = 0; i < 1000; i++) {
    const id = Math.floor(Math.random() * 64 * 64 * 64 * 64)
    const encoded = LibIds.stringify(id, 4)
    const decoded = LibIds.parse(encoded)
    expect(decoded).toBe(id)
  }
})