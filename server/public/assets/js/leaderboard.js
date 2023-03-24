const logo_BC = "/logo/logo_BC.png";
const logo_DST = "/logo/logo_DST.png";
const logo_DVT = "/logo/logo_DVT.png";
const logo_LT = "/logo/logo_LT.png";
const logo_NH = "/logo/logo_NH.png";
const logo_NHH = "/logo/logo_NHH.png";
const logo_NTN = "/logo/logo_NTN.png";
const logo_TP = "/logo/logo_TP.png";

function createTable(name, array) {
  array.sort(function (a, b) {
    return a.score < b.score;
  });
  let variable =
    '  <div class="flex flex-col rounded-[24px] rank w-full gap-3">' +
    `        <p class="text-[#1C1A1F] text-center text-[32px]">Bảng ${name}</p>` +
    '        <div class="top1-container">' +
    '          <div class="top1-img-container">' +
    "            <div" +
    '              class="top1-img-number">' +
    '              <p class="top1-img-number-text" >1</p>' +
    "            </div>" +
    `            <img src="${array[0].logo}" class="logo" />` +
    "          </div>" +
    `          <p class="top1-name">${array[0].name}</p>` +
    `          <p class="top1.score">${array[0].score}</p>` +
    "        </div>" +
    '        <div class="top3-container">' +
    '          <div class="school-container">' +
    '            <div class="top3-rank-container top2-rank-bg">' +
    '              <p class="top3-rank">#2</p>' +
    "            </div>" +
    `            <img src="${array[1].logo}" class="top3-img" />` +
    `            <p class="top3-name">${array[1].name}</p>` +
    `            <p class="top3-score">${array[1].score}</p>` +
    "          </div>" +
    '          <div class="school-container">' +
    '            <div class="top3-rank-container top3-rank-bg">' +
    '              <p class="top3-rank">#3</p>' +
    "            </div>" +
    `            <img src="${array[2].logo}" class="top3-img" />` +
    `            <p class="top3-name">${array[2].name}</p>` +
    `            <p class="top3-score">${array[2].score}</p>` +
    "          </div>" +
    "        </div>" +
    "      </div>" +
    "";
  document.getElementById("root").innerHTML += variable;
  console.log(document.getElementById("root"));
}
const tableA = [
  {
    name: "Trường THPT 1",
    logo: "/logo/kajima.png",
    score: 12,
  },
  {
    name: "Trường THPT 2",
    logo: "/logo/kajima.png",
    score: 9,
  },
  {
    name: "Trường THPT 3",
    logo: "/logo/kajima.png",
    score: 8,
  },
];
createTable("A", tableA);
createTable("B", tableA);
createTable("C", tableA);
