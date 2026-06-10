#!/usr/bin/env python3
"""Volumetric interference check for a model's part list.

Usage: python3 tools/interfere.py <parts.json>
Exit code 0 if no parts interpenetrate (ignoring face-to-face touching),
1 otherwise — so it can gate CI.
"""
import json
import math
import sys

M = 0.2  # margin: ignore face-to-face touching within 0.2"


def rotX(a, y, z):
    return (y * math.cos(a) - z * math.sin(a), y * math.sin(a) + z * math.cos(a))


def invRotX(a, y, z):
    return (y * math.cos(a) + z * math.sin(a), -y * math.sin(a) + z * math.cos(a))


def is_box(p):
    return 'size' in p


def aabb(p):
    if is_box(p):
        sx, sy, sz = p['size']
        a = p.get('rotX', 0)
        cx, cy, cz = p['pos']
        pts = []
        for dx in (-sx / 2, sx / 2):
            for dy in (-sy / 2, sy / 2):
                for dz in (-sz / 2, sz / 2):
                    yy, zz = rotX(a, dy, dz)
                    pts.append((cx + dx, cy + yy, cz + zz))
    else:
        cx, cy, cz = p['pos']
        pts = [(cx + v[0], cy + v[1], cz + v[2]) for v in p['verts']]
    xs = [q[0] for q in pts]
    ys = [q[1] for q in pts]
    zs = [q[2] for q in pts]
    return (min(xs), min(ys), min(zs), max(xs), max(ys), max(zs))


def samples(p):
    out = []
    if is_box(p):
        sx, sy, sz = p['size']
        a = p.get('rotX', 0)
        cx, cy, cz = p['pos']
        nx, ny, nz = (max(2, int(sx / 0.6)), max(2, int(sy / 0.6)), max(2, int(sz / 0.6)))
        for i in range(nx):
            lx = -sx / 2 + sx * (i + 0.5) / nx
            for j in range(ny):
                ly = -sy / 2 + sy * (j + 0.5) / ny
                for k in range(nz):
                    lz = -sz / 2 + sz * (k + 0.5) / nz
                    yy, zz = rotX(a, ly, lz)
                    out.append((cx + lx, cy + yy, cz + zz))
    else:
        v = [(p['pos'][0] + q[0], p['pos'][1] + q[1], p['pos'][2] + q[2]) for q in p['verts']]
        n = 5

        def lerp(p1, p2, s):
            return tuple(p1[d] + (p2[d] - p1[d]) * s for d in range(3))

        for a_ in range(n):
            for b_ in range(n):
                for c_ in range(n):
                    u, w, t = (a_ + 0.5) / n, (b_ + 0.5) / n, (c_ + 0.5) / n
                    e0, e1 = lerp(v[0], v[1], u), lerp(v[3], v[2], u)
                    f0, f1 = lerp(v[4], v[5], u), lerp(v[7], v[6], u)
                    out.append(lerp(lerp(e0, e1, w), lerp(f0, f1, w), t))
    return out


def faces_planes(p):
    v = [(p['pos'][0] + q[0], p['pos'][1] + q[1], p['pos'][2] + q[2]) for q in p['verts']]
    cen = tuple(sum(q[d] for q in v) / 8 for d in range(3))
    faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]
    planes = []
    for f in faces:
        a, b, c = v[f[0]], v[f[1]], v[f[2]]
        u = tuple(b[d] - a[d] for d in range(3))
        w = tuple(c[d] - a[d] for d in range(3))
        nrm = (u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0])
        L = math.hypot(*nrm) or 1
        nrm = tuple(x / L for x in nrm)
        if sum(nrm[d] * (cen[d] - a[d]) for d in range(3)) < 0:
            nrm = tuple(-x for x in nrm)
        planes.append((nrm, a))
    return planes


def inside(pt, p, m=M):
    if is_box(p):
        sx, sy, sz = p['size']
        a = p.get('rotX', 0)
        cx, cy, cz = p['pos']
        dx = pt[0] - cx
        ly, lz = invRotX(a, pt[1] - cy, pt[2] - cz)
        return abs(dx) < sx / 2 - m and abs(ly) < sy / 2 - m and abs(lz) < sz / 2 - m
    for nrm, a in p['_planes']:
        if sum(nrm[d] * (pt[d] - a[d]) for d in range(3)) < m:
            return False
    return True


def overlap(a, b):
    ax0, ay0, az0, ax1, ay1, az1 = a['_aabb']
    bx0, by0, bz0, bx1, by1, bz1 = b['_aabb']
    if ax1 < bx0 or bx1 < ax0 or ay1 < by0 or by1 < ay0 or az1 < bz0 or bz1 < az0:
        return False
    for pt in a['_s']:
        if inside(pt, b):
            return True
    for pt in b['_s']:
        if inside(pt, a):
            return True
    return False


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else '/tmp/raw.json'
    P = json.load(open(path))
    for p in P:
        p['_aabb'] = aabb(p)
        if not is_box(p):
            p['_planes'] = faces_planes(p)
        p['_s'] = samples(p)
    print('INTERPENETRATIONS (true volumetric overlap, ignoring face-to-face touching):\n')
    n = 0
    for i in range(len(P)):
        for j in range(i + 1, len(P)):
            if overlap(P[i], P[j]):
                print('  ', P[i]['name'], '<->', P[j]['name'])
                n += 1
    print('\n  total interfering pairs:', n)
    sys.exit(1 if n else 0)


if __name__ == '__main__':
    main()
