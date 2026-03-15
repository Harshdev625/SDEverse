const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Connect to DB

connectDB();

// Wait for mongoose connection before running migration logic
mongoose.connection.once('open', async () => {
  /**
   * Migration script to convert from old architecture (problems with sheetId)
   * to new architecture (many-to-many relationship via SheetProblem junction table)
   * 
   * Run this script ONCE to migrate existing data
   */

  const migrateProblemArchitecture = async () => {
    try {
      console.log('Starting migration from old to new architecture...\n');

      // Access collections directly using mongoose connection
      const db = mongoose.connection.db;
      const problemsCollection = db.collection('problems');
      const sheetProblemsCollection = db.collection('sheetproblems');

      // Find all problems that have sheetId field
      const oldProblems = await problemsCollection.find({ sheetId: { $exists: true } }).toArray();
      
      if (oldProblems.length === 0) {
        console.log('✓ No problems with sheetId found. Migration not needed or already completed.');
        process.exit(0);
      }

      console.log(`Found ${oldProblems.length} problems to migrate.\n`);

      let migratedCount = 0;
      let sheetProblemsCreated = 0;

      for (const problem of oldProblems) {
        const { _id, sheetId, order, title } = problem;

        try {
          // Create SheetProblem relationship
          const existingRelation = await sheetProblemsCollection.findOne({
            sheetId: sheetId,
            problemId: _id,
          });

          if (!existingRelation) {
            await sheetProblemsCollection.insertOne({
              sheetId: sheetId,
              problemId: _id,
              order: order || 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            sheetProblemsCreated++;
            console.log(`✓ Created SheetProblem relation: ${title}`);
          }

          // Remove sheetId and order fields from problem
          await problemsCollection.updateOne(
            { _id: _id },
            { 
              $unset: { 
                sheetId: "",
                order: ""
              } 
            }
          );

          migratedCount++;
          console.log(`✓ Migrated: ${title}`);

        } catch (error) {
          console.error(`✗ Error migrating \"${title}\":`, error.message);
        }
      }

      console.log('\n========================================');
      console.log('✅ Migration completed successfully!');
      console.log('========================================');
      console.log(`📝 Problems migrated: ${migratedCount}`);
      console.log(`🔗 Sheet-Problem relations created: ${sheetProblemsCreated}`);
      console.log('========================================\n');

      // Verify migration
      const remainingOldProblems = await problemsCollection.countDocuments({ 
        sheetId: { $exists: true } 
      });
      
      if (remainingOldProblems > 0) {
        console.warn(`⚠️  Warning: ${remainingOldProblems} problems still have sheetId field`);
      } else {
        console.log('✓ All problems successfully migrated!');
      }

      process.exit(0);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  };

  const rollbackMigration = async () => {
    try {
      console.log('Rolling back migration...\n');

      const db = mongoose.connection.db;
      const problemsCollection = db.collection('problems');
      const sheetProblemsCollection = db.collection('sheetproblems');

      // Get all SheetProblem relationships
      const sheetProblems = await sheetProblemsCollection.find({}).toArray();

      if (sheetProblems.length === 0) {
        console.log('✓ No SheetProblem relations found. Nothing to rollback.');
        process.exit(0);
      }

      console.log(`Found ${sheetProblems.length} sheet-problem relations.\n`);

      let rolledBackCount = 0;

      for (const sp of sheetProblems) {
        const { sheetId, problemId, order } = sp;

        try {
          // Add sheetId and order back to problem
          await problemsCollection.updateOne(
            { _id: problemId },
            { 
              $set: { 
                sheetId: sheetId,
                order: order || 0
              } 
            }
          );

          rolledBackCount++;
          console.log(`✓ Rolled back problem ID: ${problemId}`);

        } catch (error) {
          console.error(`✗ Error rolling back problem ${problemId}:`, error.message);
        }
      }

      // Delete all SheetProblem documents
      const deleteResult = await sheetProblemsCollection.deleteMany({});

      console.log('\n========================================');
      console.log('✅ Rollback completed!');
      console.log('========================================');
      console.log(`📝 Problems rolled back: ${rolledBackCount}`);
      console.log(`🗑️  SheetProblem relations deleted: ${deleteResult.deletedCount}`);
      console.log('========================================\n');

      process.exit(0);
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      process.exit(1);
    }
  };

  // Command line arguments
  if (process.argv[2] === '--rollback') {
    console.log('⚠️  ROLLBACK MODE - This will revert to old architecture!\n');
    rollbackMigration();
  } else {
    migrateProblemArchitecture();
  }
});
