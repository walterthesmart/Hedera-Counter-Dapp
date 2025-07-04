const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Comprehensive test suite for the Counter smart contract
 * Tests all functionality including edge cases and error conditions
 */
describe("Counter Contract", function () {
    let Counter;
    let counter;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        // Get signers
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy contract with initial count of 0
        Counter = await ethers.getContractFactory("Counter");
        counter = await Counter.deploy(0);
        await counter.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await counter.getOwner()).to.equal(owner.address);
        });

        it("Should set the initial count correctly", async function () {
            expect(await counter.getCount()).to.equal(0);
        });

        it("Should not be paused initially", async function () {
            expect(await counter.isPaused()).to.equal(false);
        });

        it("Should deploy with custom initial count", async function () {
            const customCounter = await Counter.deploy(42);
            await customCounter.waitForDeployment();
            expect(await customCounter.getCount()).to.equal(42);
        });
    });

    describe("Basic Functionality", function () {
        it("Should increment the counter", async function () {
            await counter.increment();
            expect(await counter.getCount()).to.equal(1);
        });

        it("Should decrement the counter", async function () {
            // First increment to have something to decrement
            await counter.increment();
            await counter.decrement();
            expect(await counter.getCount()).to.equal(0);
        });

        it("Should increment by specified amount", async function () {
            await counter.incrementBy(5);
            expect(await counter.getCount()).to.equal(5);
        });

        it("Should decrement by specified amount", async function () {
            await counter.incrementBy(10);
            await counter.decrementBy(3);
            expect(await counter.getCount()).to.equal(7);
        });
    });

    describe("Events", function () {
        it("Should emit CountIncremented event", async function () {
            await expect(counter.increment())
                .to.emit(counter, "CountIncremented")
                .withArgs(1, owner.address);
        });

        it("Should emit CountDecremented event", async function () {
            await counter.increment();
            await expect(counter.decrement())
                .to.emit(counter, "CountDecremented")
                .withArgs(0, owner.address);
        });

        it("Should emit CountReset event", async function () {
            await counter.increment();
            await expect(counter.reset())
                .to.emit(counter, "CountReset")
                .withArgs(owner.address);
        });
    });

    describe("Access Control", function () {
        it("Should allow only owner to reset", async function () {
            await counter.increment();
            await expect(counter.connect(addr1).reset())
                .to.be.revertedWithCustomError(counter, "OnlyOwner");
        });

        it("Should allow only owner to pause", async function () {
            await expect(counter.connect(addr1).pause())
                .to.be.revertedWithCustomError(counter, "OnlyOwner");
        });

        it("Should allow only owner to unpause", async function () {
            await counter.pause();
            await expect(counter.connect(addr1).unpause())
                .to.be.revertedWithCustomError(counter, "OnlyOwner");
        });

        it("Should allow owner to transfer ownership", async function () {
            await expect(counter.transferOwnership(addr1.address))
                .to.emit(counter, "OwnershipTransferred")
                .withArgs(owner.address, addr1.address);
            
            expect(await counter.getOwner()).to.equal(addr1.address);
        });

        it("Should not allow transfer to zero address", async function () {
            await expect(counter.transferOwnership(ethers.ZeroAddress))
                .to.be.revertedWithCustomError(counter, "InvalidAddress");
        });
    });

    describe("Pause Functionality", function () {
        it("Should pause and unpause correctly", async function () {
            await counter.pause();
            expect(await counter.isPaused()).to.equal(true);

            await counter.unpause();
            expect(await counter.isPaused()).to.equal(false);
        });

        it("Should prevent increment when paused", async function () {
            await counter.pause();
            await expect(counter.increment())
                .to.be.revertedWithCustomError(counter, "CounterPaused");
        });

        it("Should prevent decrement when paused", async function () {
            await counter.increment();
            await counter.pause();
            await expect(counter.decrement())
                .to.be.revertedWithCustomError(counter, "CounterPaused");
        });

        it("Should prevent incrementBy when paused", async function () {
            await counter.pause();
            await expect(counter.incrementBy(5))
                .to.be.revertedWithCustomError(counter, "CounterPaused");
        });

        it("Should prevent decrementBy when paused", async function () {
            await counter.incrementBy(10);
            await counter.pause();
            await expect(counter.decrementBy(5))
                .to.be.revertedWithCustomError(counter, "CounterPaused");
        });
    });

    describe("Boundary Conditions", function () {
        it("Should not allow decrement below minimum", async function () {
            await expect(counter.decrement())
                .to.be.revertedWithCustomError(counter, "MinCountExceeded");
        });

        it("Should not allow increment above maximum", async function () {
            // This would take too long to test with actual increments
            // So we'll test the incrementBy function near the limit
            const maxCount = await counter.MAX_COUNT();
            await counter.incrementBy(maxCount);
            
            await expect(counter.increment())
                .to.be.revertedWithCustomError(counter, "MaxCountExceeded");
        });

        it("Should not allow incrementBy to exceed maximum", async function () {
            const maxCount = await counter.MAX_COUNT();
            await expect(counter.incrementBy(maxCount + 1n))
                .to.be.revertedWithCustomError(counter, "MaxCountExceeded");
        });

        it("Should not allow decrementBy below minimum", async function () {
            await counter.incrementBy(5);
            await expect(counter.decrementBy(10))
                .to.be.revertedWithCustomError(counter, "MinCountExceeded");
        });
    });

    describe("View Functions", function () {
        it("Should return correct contract info", async function () {
            await counter.incrementBy(42);
            
            const [count, ownerAddr, paused, maxCount, minCount] = await counter.getContractInfo();
            
            expect(count).to.equal(42);
            expect(ownerAddr).to.equal(owner.address);
            expect(paused).to.equal(false);
            expect(maxCount).to.equal(await counter.MAX_COUNT());
            expect(minCount).to.equal(await counter.MIN_COUNT());
        });

        it("Should return correct constants", async function () {
            expect(await counter.MAX_COUNT()).to.equal(1000000);
            expect(await counter.MIN_COUNT()).to.equal(0);
        });
    });

    describe("Reset Functionality", function () {
        it("Should reset counter to zero", async function () {
            await counter.incrementBy(100);
            await counter.reset();
            expect(await counter.getCount()).to.equal(0);
        });

        it("Should allow operations after reset", async function () {
            await counter.incrementBy(50);
            await counter.reset();
            await counter.increment();
            expect(await counter.getCount()).to.equal(1);
        });
    });

    describe("Multiple Users", function () {
        it("Should allow different users to increment", async function () {
            await counter.connect(addr1).increment();
            await counter.connect(addr2).increment();
            expect(await counter.getCount()).to.equal(2);
        });

        it("Should track caller in events", async function () {
            await expect(counter.connect(addr1).increment())
                .to.emit(counter, "CountIncremented")
                .withArgs(1, addr1.address);
        });
    });
});
