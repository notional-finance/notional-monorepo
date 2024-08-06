function ltrim(str: any) {
  if (!str) return str;
  return str.replace(/^\s+/g, '');
}

function rtrim(str: any) {
  if (!str) return str;
  return str.replace(/\s+$/g, ' ');
}

function trimFc(formik: any) {
  return (e: any) => {
    const ff = ltrim(rtrim(e.target.value));
    formik.setFieldValue(e.target.name, ff);
  };
}

export default trimFc;
