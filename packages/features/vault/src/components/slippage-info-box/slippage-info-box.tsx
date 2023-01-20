// import { useTheme, Box, Typography, styled } from '@mui/material';
// import { LabeledText } from '@notional-finance/mui';
// import { FormattedMessage } from 'react-intl';

// const StyledInfoBox = styled(Box)(
//   ({ theme }) => `
//   border-radius: ${theme.shape.borderRadiusLarge};
//   background-color: ${theme.palette.background.default};
//   padding-top: 1rem;
//   padding-bottom: 1rem;
//   padding-left: 1.5rem;
//   padding-right: 1.5rem;
// `
// );

// const StyledLabels = styled(Box)`
//   display: flex;
//   justify-content: start;
// `;

// const StyledLabel = styled(Box)`
//   display: flex;
//   margin-left: 0.5rem;
//   margin-right: 2rem;
// `;

// export const SlippageInfoBox = () => {
//   const theme = useTheme();
//   return (
//     <StyledInfoBox>
//       <Typography
//         sx={{
//           display: 'block',
//           marginBottom: '1rem',
//           marginLeft: '0.5rem',
//           color: theme.palette.common.black,
//         }}
//         variant="caption"
//       >
//         <FormattedMessage id="view.vault.deposit.vaultParameters" />
//       </Typography>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//         <StyledLabels>
//           <StyledLabel>
//             <LabeledText
//               label={<FormattedMessage id="view.vault.deposit.maxSlippage" />}
//               value={'0.025%'}
//               labelAbove
//             />
//           </StyledLabel>
//           <StyledLabel>
//             <LabeledText label="Price Impact" value={12.23} labelAbove />
//           </StyledLabel>
//         </StyledLabels>
//         <Box sx={{ display: 'block' }}>
//           <Typography variant="caption">
//             <FormattedMessage id="view.vault.deposit.customize" />
//           </Typography>
//           {/* <ToggleSwitch
//             isChecked={checked}
//             onChecked={() => setChecked(true)}
//             onUnchecked={() => setChecked(false)}
//             sx={{
//               textAlign: 'right',
//               // This aligns the switch to the right side
//               // of the box
//               '.MuiSwitch-root': {
//                 left: '12px',
//               },
//             }}
//           /> */}
//         </Box>
//       </Box>
//     </StyledInfoBox>
//   );
// };

// export default SlippageInfoBox;
