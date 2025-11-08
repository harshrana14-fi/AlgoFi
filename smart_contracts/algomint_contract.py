from pyteal import *

def approval_program():
    """
    AlgoFi NFT Marketplace Smart Contract
    Handles NFT minting, listing, and trading on Algorand
    """
    
    # Global state keys
    owner_key = Bytes("owner")
    nft_count_key = Bytes("nft_count")
    platform_fee_key = Bytes("platform_fee")  # Fee in basis points (e.g., 250 = 2.5%)
    
    # Local state keys for NFT metadata
    nft_creator_key = Bytes("creator")
    nft_price_key = Bytes("price")
    nft_purchasable_key = Bytes("purchasable")
    nft_name_key = Bytes("name")
    nft_type_key = Bytes("type")  # art, music, standard
    
    # Operations
    op_initialize = Bytes("initialize")
    op_mint_nft = Bytes("mint_nft")
    op_list_nft = Bytes("list_nft")
    op_buy_nft = Bytes("buy_nft")
    op_update_price = Bytes("update_price")
    op_delist_nft = Bytes("delist_nft")
    
    @Subroutine(TealType.uint64)
    def initialize():
        """Initialize the marketplace contract"""
        return Seq([
            App.globalPut(owner_key, Txn.sender()),
            App.globalPut(nft_count_key, Int(0)),
            App.globalPut(platform_fee_key, Int(250)),  # 2.5% platform fee
            Int(1)
        ])
    
    @Subroutine(TealType.uint64)
    def mint_nft():
        """
        Mint a new NFT (purchasable or non-purchasable)
        Args: name, type, purchasable, price (if purchasable)
        """
        nft_name = Txn.application_args[1]
        nft_type = Txn.application_args[2]
        is_purchasable = Btoi(Txn.application_args[3])
        nft_price = Btoi(Txn.application_args[4])
        
        return Seq([
            # Validate inputs
            Assert(Len(nft_name) > Int(0)),
            Assert(Or(
                nft_type == Bytes("art"),
                nft_type == Bytes("music"),
                nft_type == Bytes("standard")
            )),
            Assert(Or(
                is_purchasable == Int(0),
                And(is_purchasable == Int(1), nft_price > Int(0))
            )),
            
            # Store NFT metadata in local state
            App.localPut(Txn.sender(), nft_creator_key, Txn.sender()),
            App.localPut(Txn.sender(), nft_name_key, nft_name),
            App.localPut(Txn.sender(), nft_type_key, nft_type),
            App.localPut(Txn.sender(), nft_purchasable_key, is_purchasable),
            App.localPut(Txn.sender(), nft_price_key, nft_price),
            
            # Increment NFT count
            App.globalPut(nft_count_key, App.globalGet(nft_count_key) + Int(1)),
            
            Int(1)
        ])
    
    @Subroutine(TealType.uint64)
    def list_nft():
        """
        List an NFT for sale
        Args: nft_id, price
        """
        price = Btoi(Txn.application_args[1])
        
        return Seq([
            # Validate sender is the creator
            Assert(App.localGet(Txn.sender(), nft_creator_key) == Txn.sender()),
            Assert(price > Int(0)),
            Assert(App.localGet(Txn.sender(), nft_purchasable_key) == Int(1)),
            
            # Update price
            App.localPut(Txn.sender(), nft_price_key, price),
            
            Int(1)
        ])
    
    @Subroutine(TealType.uint64)
    def buy_nft():
        """
        Purchase an NFT
        Args: seller_address
        """
        seller = Txn.accounts[1]
        nft_price = App.localGet(seller, nft_price_key)
        platform_fee = App.globalGet(platform_fee_key)
        
        # Calculate platform fee and seller amount
        fee_amount = (nft_price * platform_fee) / Int(10000)
        seller_amount = nft_price - fee_amount
        
        return Seq([
            # Validate NFT is purchasable and listed
            Assert(App.localGet(seller, nft_purchasable_key) == Int(1)),
            Assert(nft_price > Int(0)),
            
            # Validate payment transactions
            Assert(Gtxn[Txn.group_index() - Int(1)].type_enum() == TxnType.Payment),
            Assert(Gtxn[Txn.group_index() - Int(1)].receiver() == seller),
            Assert(Gtxn[Txn.group_index() - Int(1)].amount() == seller_amount),
            
            # Platform fee payment
            Assert(Gtxn[Txn.group_index() - Int(2)].type_enum() == TxnType.Payment),
            Assert(Gtxn[Txn.group_index() - Int(2)].receiver() == App.globalGet(owner_key)),
            Assert(Gtxn[Txn.group_index() - Int(2)].amount() == fee_amount),
            
            # Transfer NFT ownership
            App.localPut(Txn.sender(), nft_creator_key, App.localGet(seller, nft_creator_key)),
            App.localPut(Txn.sender(), nft_name_key, App.localGet(seller, nft_name_key)),
            App.localPut(Txn.sender(), nft_type_key, App.localGet(seller, nft_type_key)),
            App.localPut(Txn.sender(), nft_purchasable_key, App.localGet(seller, nft_purchasable_key)),
            App.localPut(Txn.sender(), nft_price_key, Int(0)),  # Reset price after purchase
            
            # Clear seller's NFT data
            App.localDel(seller, nft_creator_key),
            App.localDel(seller, nft_name_key),
            App.localDel(seller, nft_type_key),
            App.localDel(seller, nft_purchasable_key),
            App.localDel(seller, nft_price_key),
            
            Int(1)
        ])
    
    @Subroutine(TealType.uint64)
    def update_price():
        """Update NFT listing price"""
        new_price = Btoi(Txn.application_args[1])
        
        return Seq([
            Assert(App.localGet(Txn.sender(), nft_creator_key) == Txn.sender()),
            Assert(new_price > Int(0)),
            Assert(App.localGet(Txn.sender(), nft_purchasable_key) == Int(1)),
            
            App.localPut(Txn.sender(), nft_price_key, new_price),
            
            Int(1)
        ])
    
    @Subroutine(TealType.uint64)
    def delist_nft():
        """Remove NFT from marketplace listing"""
        return Seq([
            Assert(App.localGet(Txn.sender(), nft_creator_key) == Txn.sender()),
            
            App.localPut(Txn.sender(), nft_price_key, Int(0)),
            
            Int(1)
        ])
    
    # Main approval program logic
    program = Cond(
        [Txn.application_id() == Int(0), Return(initialize())],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Txn.sender() == App.globalGet(owner_key))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Txn.sender() == App.globalGet(owner_key))],
        [Txn.application_args[0] == op_mint_nft, Return(mint_nft())],
        [Txn.application_args[0] == op_list_nft, Return(list_nft())],
        [Txn.application_args[0] == op_buy_nft, Return(buy_nft())],
        [Txn.application_args[0] == op_update_price, Return(update_price())],
        [Txn.application_args[0] == op_delist_nft, Return(delist_nft())]
    )
    
    return program

def clear_state_program():
    """Clear state program - always approves"""
    return Return(Int(1))

# Compile programs
if __name__ == "__main__":
    with open("approval.teal", "w") as f:
        compiled_approval = compileTeal(approval_program(), mode=Mode.Application, version=8)
        f.write(compiled_approval)
    
    with open("clear.teal", "w") as f:
        compiled_clear = compileTeal(clear_state_program(), mode=Mode.Application, version=8)
        f.write(compiled_clear)
    
    print("✅ Smart contracts compiled successfully!")
    print("📄 Files created:")
    print("   - approval.teal")
    print("   - clear.teal")