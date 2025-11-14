import React from "react";

const DefaultBackground = () => {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 opacity-3">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-transparent to-transparent bg-[length:32px_32px] bg-[image:repeating-linear-gradient(0deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_32px),repeating-linear-gradient(90deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_32px)]" />
      </div>
      {/* 添加渐变遮罩增强质感 */}
      <div className="absolute inset-0 bg-gradient-to-br from-background-50/3 via-transparent to-primary-50/10 pointer-events-none" />
    </div>
  );
};

export default DefaultBackground;
