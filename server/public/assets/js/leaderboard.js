function createTable(name, array) {
  array.sort(function (a, b) {
    return a.score < b.score;
  });
  let variable =
    '  <div class="flex flex-col rounded-[24px] rank w-full gap-3">' +
    `        <p class="text-[#1C1A1F] text-center text-[32px]">Bảng ${name}</p>` +
    '        <div class="flex flex-col w-full items-center px-5">' +
    '          <div class="flex flex-col relative justify-center items-center rounded-full w-[120px] h-[120px]">' +
    "            <div" +
    '              class="flex flex-col right-1 top-1 border-[2px] border-[rgba(0,255,145,1)] text-center items-center justify-center w-[30px] h-[30px] absolute bg-[#FFAB00] rounded-full z-20">' +
    '              <p class="text-[#fff] text-[18px]">1</p>' +
    "            </div>" +
    `            <img src="${array[0].logo}" class="w-full h-full object-cover " />` +
    "          </div>" +
    `          <p class="text-[#fff] text-center text-[18px] ">${array[0].name}</p>` +
    `          <p class="text-[#ffffffb3] text-center text-[14px] font-[700]">${array[0].score}</p>` +
    "        </div>" +
    '        <div class="flex flex-col bg-[#fff] w-full bg-[#fff] rounded-[24px] p-5 gap-3">' +
    '          <div class="flex flex-row items-center gap-3">' +
    '            <div class="flex flex-col py-[6px] px-[16px] bg-[#E685B5] rounded-[16px]">' +
    '              <p class="text-[#fff] font-[700] text-[16px]">#2</p>' +
    "            </div>" +
    `            <img src="${array[1].logo}" class="w-[50px] h-[50px] rounded-full object-cover" />` +
    `            <p class="text-[#1C1A1F] text-[16px] font-[700]">${array[1].name}</p>` +
    `            <p class="text-[#777E90] text-[16px] font-[700] ml-auto">${array[1].score}</p>` +
    "          </div>" +
    '          <div class="flex flex-row items-center gap-3">' +
    '            <div class="flex flex-col py-[6px] px-[16px] bg-[#34C759] rounded-[16px]">' +
    '              <p class="text-[#fff] font-[700] text-[16px]">#3</p>' +
    "            </div>" +
    `            <img src="${array[2].logo}" class="w-[50px] h-[50px] rounded-full object-cover" />` +
    `            <p class="text-[#1C1A1F] text-[16px] font-[700]">${array[2].name}</p>` +
    `            <p class="text-[#777E90] text-[16px] font-[700] ml-auto">${array[2].score}</p>` +
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
    logo: "/logo/avatar.svg",
    score: 12,
  },
  {
    name: "Trường THPT 2",
    logo: "/logo/avatar.svg",
    score: 9,
  },
  {
    name: "Trường THPT 3",
    logo: "/logo/avatar.svg",
    score: 8,
  },
];
createTable("A", tableA);
createTable("B", tableA);
