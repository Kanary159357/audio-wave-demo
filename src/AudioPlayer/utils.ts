export function getAverageBlockList(
  totalCnt: number,
  blockSize: number,
  blockList: Float32Array
) {
  let filteredData = [];
  for (let i = 0; i < totalCnt; i++) {
    const blockStart = blockSize * i; // 샘플 구간 시작 포인트
    let blockSum = 0;

    for (let j = 0; j < blockSize; j++) {
      if (blockList[blockStart + j]) {
        blockSum = blockSum + Math.abs(blockList[blockStart + j]);
      }
    }

    filteredData.push(blockSum / blockSize); // 구간 평균치를 결과 배열에 추가
  }
  return filteredData;
}

export async function getAudioBufferFromResponse(response: Response) {
  const audioCtx = new AudioContext();
  const buffer = await response.clone().arrayBuffer();
  return await audioCtx.decodeAudioData(buffer);
}

export function normalizePeak(arr: number[]) {
  const maxPeak = Math.max(...arr);
  return arr.map((item) => item / maxPeak);
}
