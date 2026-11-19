const pairOddVertices = (figure, links, degree) => {
  const distance = (a, b) =>
    Math.hypot(figure.points[a][0] - figure.points[b][0], figure.points[a][1] - figure.points[b][1]);
  let odd = [...Array(figure.points.length).keys()].filter((v) => degree[v] % 2);
  while (odd.length > 2) {
    let bestI = 1;
    let bestJ = 2;
    let bestDistance = Infinity;
    for (let i = 0; i < odd.length; i++) {
      for (let j = i + 1; j < odd.length; j++) {
        const d = distance(odd[i], odd[j]);
        if (d < bestDistance) {
          bestDistance = d;
          bestI = i;
          bestJ = j;
        }
      }
    }
    links.push({ a: odd[bestI], b: odd[bestJ], virtual: true });
    odd = odd.filter((_, k) => k !== bestI && k !== bestJ);
  }
  return odd;
};

const eulerWalk = (vertexCount, links, start) => {
  const used = new Array(links.length).fill(false);
  const incident = [...Array(vertexCount)].map(() => []);
  links.forEach((link, k) => {
    incident[link.a].push(k);
    incident[link.b].push(k);
  });
  const stack = [{ vertex: start, link: -1 }];
  const walk = [];
  while (stack.length) {
    const top = stack[stack.length - 1];
    const next = incident[top.vertex].find((k) => !used[k]);
    if (next === undefined) walk.push(stack.pop());
    else {
      used[next] = true;
      const link = links[next];
      stack.push({ vertex: link.a === top.vertex ? link.b : link.a, link: next });
    }
  }
  return walk.reverse();
};

export const buildPenTrails = (figure) => {
  const vertexCount = figure.points.length;
  const links = figure.edges.map(([a, b]) => ({ a, b, virtual: false }));
  const degree = new Array(vertexCount).fill(0);
  links.forEach((link) => {
    degree[link.a]++;
    degree[link.b]++;
  });
  const odd = pairOddVertices(figure, links, degree);
  const start = odd.length ? Math.min(...odd) : 0;
  const walk = eulerWalk(vertexCount, links, start);
  const trails = [[]];
  for (let i = 1; i < walk.length; i++) {
    const link = links[walk[i].link];
    if (link.virtual) {
      if (trails[trails.length - 1].length) trails.push([]);
      continue;
    }
    trails[trails.length - 1].push({ a: walk[i - 1].vertex, b: walk[i].vertex });
  }
  return trails.filter((trail) => trail.length);
};
