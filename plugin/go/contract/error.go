package contract

import (
	"fmt"
	"reflect"
)

/* This file contains contract level PluginErrors */

const DefaultModule = "plugin"

// NewError() creates a plugin error
func NewError(code uint64, module, message string) *PluginError {
	return &PluginError{Code: code, Module: module, Msg: message}
}

// Error() implements the errors interface
func (p *PluginError) Error() string {
	return fmt.Sprintf("\nModule:  %s\nCode:    %d\nMessage: %s", p.Module, p.Code, p.Msg)
}

func ErrPluginTimeout() *PluginError {
	return NewError(1, DefaultModule, "a plugin timeout occurred")
}

func ErrMarshal(err error) *PluginError {
	return NewError(2, DefaultModule, fmt.Sprintf("marshal() failed with err: %s", err.Error()))
}

func ErrUnmarshal(err error) *PluginError {
	return NewError(3, DefaultModule, fmt.Sprintf("unmarshal() failed with err: %s", err.Error()))
}

func ErrFailedPluginRead(err error) *PluginError {
	return NewError(4, DefaultModule, fmt.Sprintf("a plugin read failed with err: %s", err.Error()))
}

func ErrFailedPluginWrite(err error) *PluginError {
	return NewError(5, DefaultModule, fmt.Sprintf("a plugin write failed with err: %s", err.Error()))
}

func ErrInvalidPluginRespId() *PluginError {
	return NewError(6, DefaultModule, "plugin response id is invalid")
}

func ErrUnexpectedFSMToPlugin(t reflect.Type) *PluginError {
	return NewError(7, DefaultModule, fmt.Sprintf("unexpected FSM to plugin: %v", t))
}

func ErrInvalidFSMToPluginMMessage(t reflect.Type) *PluginError {
	return NewError(8, DefaultModule, fmt.Sprintf("invalid FSM to plugin: %v", t))
}

func ErrInsufficientFunds() *PluginError {
	return NewError(9, DefaultModule, "insufficient funds")
}

func ErrFromAny(err error) *PluginError {
	return NewError(10, DefaultModule, fmt.Sprintf("fromAny() failed with err: %s", err.Error()))
}

func ErrInvalidMessageCast() *PluginError {
	return NewError(11, DefaultModule, "the message cast failed")
}

func ErrInvalidAddress() *PluginError {
	return NewError(12, DefaultModule, "address is invalid")
}

func ErrInvalidAmount() *PluginError {
	return NewError(13, DefaultModule, "amount is invalid")
}

func ErrTxFeeBelowStateLimit() *PluginError {
	return NewError(14, DefaultModule, "tx.fee is below state limit")
}

func ErrAdminNotSet() *PluginError {
	return NewError(15, DefaultModule, "admin is not set; genesis did not initialize the admin record")
}

func ErrInvalidSymbol() *PluginError {
	return NewError(16, DefaultModule, "asset symbol is invalid (2-12 chars of A-Z/0-9, starting with a letter, not reserved)")
}

func ErrSymbolTaken() *PluginError {
	return NewError(17, DefaultModule, "asset symbol is already registered")
}

func ErrAssetNotFound() *PluginError {
	return NewError(18, DefaultModule, "asset not found")
}

func ErrInvalidAssetClass() *PluginError {
	return NewError(19, DefaultModule, "asset class is invalid or not enabled")
}

func ErrInvalidGatePolicy() *PluginError {
	return NewError(20, DefaultModule, "gate policy is invalid, not enabled, or not allowed for this asset")
}

func ErrInvalidTier() *PluginError {
	return NewError(21, DefaultModule, "asset tier is invalid (must be 1 or 2)")
}

func ErrNotAllowed() *PluginError {
	return NewError(22, DefaultModule, "address is not allowed by the asset gate")
}

func ErrGenesis(msg string) *PluginError {
	return NewError(23, DefaultModule, "genesis failed: "+msg)
}

func ErrRegistryFull() *PluginError {
	return NewError(24, DefaultModule, "asset registry is full")
}

func ErrGateNotAllowlist() *PluginError {
	return NewError(25, DefaultModule, "asset does not use an allowlist gate")
}

func ErrParamsNotSet() *PluginError {
	return NewError(26, DefaultModule, "cUSD parameters have not been set by the admin")
}

func ErrInvalidParams() *PluginError {
	return NewError(27, DefaultModule, "cUSD parameters are invalid")
}

func ErrPriceNotSet() *PluginError {
	return NewError(28, DefaultModule, "the CNPY price has not been posted")
}

func ErrPriceStale() *PluginError {
	return NewError(29, DefaultModule, "the CNPY price is stale; the admin must post a fresh price")
}

func ErrInvalidPrice() *PluginError {
	return NewError(30, DefaultModule, "price must be greater than zero and below the maximum")
}

func ErrPriceMoveTooLarge() *PluginError {
	return NewError(31, DefaultModule, "price update exceeds the maximum allowed move")
}

func ErrSupplyCapExceeded() *PluginError {
	return NewError(32, DefaultModule, "cUSD supply cap exceeded")
}

func ErrUndercollateralized() *PluginError {
	return NewError(33, DefaultModule, "operation would leave the vault below the minimum collateral ratio")
}

func ErrVaultHealthy() *PluginError {
	return NewError(34, DefaultModule, "vault is above the liquidation ratio")
}

func ErrInsufficientCollateral() *PluginError {
	return NewError(35, DefaultModule, "insufficient collateral in vault")
}

func ErrInsufficientCUSD() *PluginError {
	return NewError(36, DefaultModule, "insufficient cUSD balance")
}

func ErrInsufficientDebt() *PluginError {
	return NewError(37, DefaultModule, "amount exceeds the vault's debt")
}

func ErrSelfTransfer() *PluginError {
	return NewError(38, DefaultModule, "the two addresses must differ")
}

func ErrLiquidationTooLarge() *PluginError {
	return NewError(39, DefaultModule, "liquidation would seize more collateral than the vault holds")
}

func ErrInsufficientUnits() *PluginError {
	return NewError(40, DefaultModule, "insufficient asset units")
}

func ErrOrderNotFound() *PluginError {
	return NewError(41, DefaultModule, "order not found")
}

func ErrNotOrderOwner() *PluginError {
	return NewError(42, DefaultModule, "signer does not own this order")
}

func ErrInvalidSide() *PluginError {
	return NewError(43, DefaultModule, "order side must be buy or sell")
}

func ErrSelfTrade() *PluginError {
	return NewError(44, DefaultModule, "order would match the owner's own resting order; cancel it first")
}

func ErrCorruptState() *PluginError {
	return NewError(45, DefaultModule, "state is inconsistent: a book entry points at a missing order")
}

func ErrReservedAddress() *PluginError {
	return NewError(46, DefaultModule, "address is reserved by the protocol")
}
