import fetch from 'node-fetch';

export default async () => {
  try {
    const res = await fetch('http://api.pouet.net/v1/stats/');
    if (!res.ok) throw res.statusText;

    const json = await res.json();
    return json;
  } catch (e) {
    return { error: true, e };
  }
};
