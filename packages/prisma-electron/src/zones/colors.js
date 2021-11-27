const toStyleRGBA = proto => {
  const red = proto.r || 0;
  const green = proto.g || 0;
  const blue = proto.b || 0;
  const alpha = proto.a !== undefined ? proto.a : 1;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export default toStyleRGBA;
