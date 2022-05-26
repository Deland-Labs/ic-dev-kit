export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'test_one_way' : IDL.Func([IDL.Principal], [], ['oneway']),
  });
};
export const init = ({ IDL }) => { return []; };
