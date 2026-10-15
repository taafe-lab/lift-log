# The owner's training notes, cleaned up. Each set line is oldest -> newest.
# "100kg 10, 9" means 100 kg x 10 reps, then 100 kg x 9 reps. "BW" = bodyweight (0 kg).
# A weight carries forward until a new one appears.
# Keys: "workout.slot" -> { exercise_key: [set1, set2, ...] }
# A set line of None means "drop set row with no recorded numbers".

NOTES = {
    # ---------------- PUSH A ----------------
    "pushA.inclinePress": {
        "smithInclinePress": [
            "100kg 10, 10, 10, 10, 10",
            "100kg 8, 9, 9, 9, 9",
            "100kg 6, 6, 7, 7",
        ],
        "inclineMachinePress": [
            "40kg 12, 50kg 12, 12, 55kg 12, 60kg 12, 12, 10",
            "50kg 12, 10, 12, 55kg 10, 12, 60kg 9, 9, 8",
            "50kg 11, 9, 55kg 9, 9, 60kg 8, 7, 5",
        ],
    },
    "pushA.flatPress": {
        "flatMachinePress": [
            "40kg 9, 9, 10, 10, 9, 12, 45kg 9, 9",
            "40kg 8, 9, 10, 10, 10, 45kg 10, 8, 8",
            "40kg 8, 9, 9, 8, 8, 45kg 8, 5, 40kg 8",
        ],
        "smithFlatPress": [
            "80kg 12, 12",
            "80kg 10, 10",
            "80kg 8, 7",
        ],
        "barbellBench": [
            "80kg 10",
            "80kg 8",
            "70kg 9",
        ],
    },
    "pushA.inclineFly": {
        "inclineMachineFly": [
            "10kg 10, 12, 12, 13, 13, 15kg 13",
            "10kg 12, 12.5kg 12, 12, 13, 13, 15kg 11",
            "12.5kg 12, 15kg 12, 13, 13, 13",
        ],
        "inclineDbFly": [
            "20kg 13, 27.5kg 12, 12, 12, 11",
            "20kg 12, 25kg 12, 27.5kg 12",
            "20kg 12, 27.5kg 12, 12, 12, 8",
        ],
    },
    "pushA.shoulderPress": {
        "seatedMachineShoulderPress": [
            "40kg 10, 10, 10, 12, 12, 12",
            "40kg 10, 10, 10, 10, 10, 11",
            "40kg 8, 9, 8, 6, 8",
        ],
        "dbShoulderPress": [
            "30kg 10",
            "35kg 9, 10, 9, 32.5kg 7",
            "35kg 8, 9, 8, 30kg 8",
        ],
        "militaryPress": [
            "50kg 10",
            "50kg 9",
            "50kg 9, 9",
        ],
    },
    "pushA.cableLateral": {
        "cableLateral": [
            "10kg 12, 15, 15, 15, 15kg 15, 15, 15, 20, 20",
            "15kg 12, 12, 15, 15, 15, 17, 17, 20, 20",
            "15kg 12, 12, 15, 15, 15, 17, 17, 18, 20",
            "15kg 12, 14, 15, 15, 17, 17, 17, 18, 20",
        ],
    },
    "pushA.overheadTriceps": {
        "overheadCableTriceps": [
            "60kg 10, 15, 15, 70kg 12, 12",
            "60kg 10, 70kg 12, 12, 12, 12",
            "60kg 10, 80kg 12, 12",
        ],
        "overheadDbTriceps": [
            "40kg 8",
            "35kg 12",
            "35kg 11",
        ],
    },
    "pushA.pushdown": {
        "vbarPushdown": [
            "60kg 13, 80kg 11, 12",
            "70kg 12, 80kg 10, 12, 12",
        ],
    },

    # ---------------- PULL A ----------------
    "pullA.shrugs": {
        "machineShrug": [
            "80kg 13, 15, 15",
            "80kg 15, 16",
            "80kg 15, 16",
            "80kg 15, 16",
        ],
    },
    "pullA.overheadPulldown": {
        "overheadPulldown": [
            "80kg 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 100kg 12, 12, 12, 12, 12",
            "100kg 9, 10, 11, 12, 9, 9, 9, 8, 9, 10, 10, 10, 11, 11, 10, 11",
            "100kg 9, 8, 9, 10, 10, 9, 9, 8, 10, 9, 8, 11",
        ],
    },
    "pullA.widePulldown": {
        "widePulldown": [
            "75kg 10, 10, 10, 10, 10, 10, 12, 12, 82.5kg 9, 11, 11, 12, 9, 12, 12, 12, 12, 12",
            "82.5kg 10, 10, 10, 10, 9, 9, 10, 10, 9, 10, 9, 10, 8, 11, 10, 10, 11, 12",
            "82.5kg 9, 9, 10, 10, 10, 9, 8, 9, 10, 9, 8, 9, 8, 9, 8, 8, 10, 10, 9",
        ],
    },
    "pullA.lowRow": {
        "lowRowOverhand": [
            "40kg 12, 12, 12, 12, 12, 12, 12, 12, 12, 50kg 12, 12, 40kg 12",
            "50kg 8, 9, 10, 10, 10, 10, 10, 12, 12, 12",
            "50kg 9, 9, 10, 11, 10, 10, 10, 10, 10, 10",
        ],
        "lowRowNeutral": [
            "40kg 12, 12, 11",
            "40kg 10, 12",
            "40kg 10, 12, 11",
        ],
    },
    "pullA.chestSupportedRow": {
        "chestSupportedRow": [
            "50kg 12, 12, 12, 12, 12, 12, 60kg 12, 12, 65kg 9, 9, 10, 11, 11, 12, 11, 11, 12",
            "55kg 12, 12, 12, 12, 12, 60kg 11, 12, 65kg 8, 8, 8, 9, 9, 10, 10, 9, 9",
            "60kg 9, 9, 9, 10, 9, 10, 10, 65kg 8, 8, 8, 8, 8, 9, 8, 8",
        ],
    },
    "pullA.highRow": {
        "highRow": [
            "60kg 9, 10, 10, 10, 10, 10, 12, 12, 65kg 12, 10, 10, 10, 11, 10",
            "60kg 8, 9, 10, 11, 10, 10, 12, 12, 65kg 10, 10, 10, 10, 10, 10",
        ],
    },
    "pullA.rearDeltFly": {
        "rearDeltDbFly": [
            "12.5kg 15, 15, 15, 17.5kg 11, 11, 12",
            "15kg 12, 15, 15, 17.5kg 10, 10, 10",
            "15kg 12, 13, 13, 17.5kg 10",
        ],
        "rearCableCrossover": [
            "10kg 12, 12",
            "10kg 12, 12",
            "10kg 11",
        ],
        "singleArmRearFly": [
            "10kg 15, 15",
            "15kg 12, 15",
            "15kg 12, 15",
        ],
    },
    "pullA.facePull": {
        "facePull": [
            "20kg 12, 45kg 15, 50kg 15",
            "25kg 12, 50kg 15, 57.5kg 15",
            "30kg 15, 65kg 12",
        ],
    },
    "pullA.machinePreacher": {
        "machinePreacher": [
            "50kg 10, 12, 12, 55kg 13, 15, 15, 60kg 12, 12, 13, 65kg 14, 15, 15, 15",
            "50kg 10, 55kg 12, 12, 13, 13, 15, 60kg 11, 12, 65kg 10, 10, 12, 10",
            "50kg 10, 55kg 12, 11, 12, 65kg 10",
            "65kg 8, 9, 10",
        ],
    },
    "pullA.altCurl": {
        "altDbCurl": [
            "15kg 10",
            "15kg 10",
            "17.5kg 10",
        ],
    },

    # ---------------- LEGS A ----------------
    "legsA.standingCalf": {
        "standingCalf": [
            "40kg 20, 20, 20, 20, 20, 45kg 20, 20, 20, 50kg 20, 20, 55kg 20, 20, 20, 20, 20, 20",
            "40kg 20, 20, 20, 20, 20, 45kg 20, 20, 20, 50kg 20, 20, 55kg 20, 20, 20, 20, 20, 20",
            "40kg 16, 18, 20, 20, 45kg 20, 20, 20, 50kg 20, 20, 55kg 20, 20, 20, 20, 20, 20",
            "40kg 15, 16, 18, 20, 45kg 20, 17, 20, 20, 50kg 20, 55kg 17, 17, 18, 19, 20",
        ],
    },
    "legsA.sldl": {
        "sldl": [
            "22.5kg 15, 15, 15, 15, 15, 15, 35kg 10, 10, 12, 12, 12, 15, 15, 15, 15",
            "32.5kg 12, 12, 15, 15, 15, 15, 35kg 10, 12, 12, 12, 15, 15, 15, 15",
            "32.5kg 12, 12, 15, 15, 35kg 15, 15, 11, 12, 15, 15, 15, 37.5kg 15, 15",
        ],
    },
    "legsA.adduction": {
        "adduction": [
            "40kg 20, 20, 20",
            "40kg 20, 20, 42.5kg 20",
            "40kg 20, 20, 42.5kg 20",
        ],
    },
    "legsA.machineSquat": {
        "machineSquat": [
            "80kg 10, 10, 10, 10, 10, 10, 120kg 10, 10, 10, 10, 10, 10, 10",
            "120kg 10, 10, 10, 10, 10, 10, 160kg 10, 10, 10, 10, 10, 10, 10, 10, 10",
            "120kg 10, 140kg 10, 160kg 10, 170kg 10, 10, 10, 8, 8, 8, 8, 10, 12, 12",
        ],
    },
    "legsA.legPress": {
        "legPress": [
            "200kg 10, 10, 10, 12, 12",
            "300kg 10, 10, 10, 10, 12",
            "350kg 10, 10, 9, 10, 10",
        ],
    },
    "legsA.legExtension": {
        "legExtension": [
            "110kg 12, 109kg 12, 12, 15, 16, 17, 18, 20, 20",
            "110kg 12, 109kg 12, 12, 15, 16, 17, 18, 18",
            "110kg 12, 109kg 15, 15, 16, 14",
        ],
    },

    # ---------------- PUSH B ----------------
    "pushB.seatedDbLateral": {
        "seatedDbLateral": [
            "15kg 12, 15, 15, 15, 17.5kg 14, 16, 17, 19, 20, 20",
            "15kg 12, 13, 15, 15, 17.5kg 12, 14, 13, 15, 17, 17",
            "15kg 12, 14, 15, 17.5kg 11, 12, 17, 17",
            "17.5kg 17, 17",
            "DROP ? 10",
        ],
    },
    "pushB.seatedShoulderPress": {
        "seatedMachineShoulderPress": [
            "40kg 10, 12",
            "40kg 7, 8",
            "35kg 7, 40kg 8",
        ],
    },
    "pushB.standingShoulderPress": {
        "standingMachineShoulderPress": [
            "40kg 12, 12, 12, 12, 12, 12, 12, 12, 50kg 10, 60kg 10, 10",
            "60kg 10, 10, 10, 8, 50kg 9, 9, 10, 9, 60kg 9, 6",
            "60kg 8, 8, 7, 6, 50kg 8, 8, 10, 10, 60kg 8, 50kg 10",
            None,
        ],
    },
    "pushB.inclineBench": {
        "inclineBarbellBench": [
            "80kg 10, 10, 90kg 10, 8",
            "80kg 10, 90kg 10, 9, 100kg 7, 80kg 8",
            "80kg 8, 90kg 7, 8, 8, 80kg 8",
        ],
        "smithInclinePress": [
            "90kg 10, 10",
            "90kg 10, 7",
            "90kg 8, 5",
        ],
    },
    "pushB.flatMachinePress": {
        "flatMachinePress": [
            "40kg 8, 10, 10, 11, 12, 8, 10, 8",
            "40kg 7, 8, 10, 10, 45kg 10, 40kg 9, 7",
            "40kg 8, 9, 10, 9, 45kg 8, 9, 40kg 9, 7",
        ],
    },
    "pushB.dips": {
        "chestDips": [
            "BW 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16",
            "BW 13, 13, 14, 14, 14, 13, 13, 15, 15, 15, 15, 15, 14",
            "BW 12, 12, 12, 14, 13, 11, 11, 13, 15, 12, 15, 15, 15, 15",
        ],
    },
    "pushB.flatFly": {
        "flatMachineFly": [
            "75kg 12, 12, 15, 15, 15, 85kg 12, 12, 90kg 12, 12, 12, 80kg 10, 10",
            "80kg 12, 13, 13, 14, 14, 90kg 9, 10, 9, 12, 10, 80kg 9, 9",
            "85kg 12, 13, 10, 11, 90kg 10, 9, 10, 9, 75kg 9, 10",
        ],
    },
    "pushB.overheadDbTriceps": {
        "overheadDbTriceps": [
            "30kg 15, 15",
            "40kg 9, 10",
            "40kg 8, 12",
        ],
    },
    "pushB.pushdown": {
        "vbarPushdown": [
            "50kg 15, 15",
            "60kg 13, 12",
            "60kg 12",
        ],
    },

    # ---------------- PULL B ----------------
    "pullB.dbShrugs": {
        "dbShrug": [
            "30kg 20, 20, 20, 20",
            "32.5kg 17, 20, 35kg 20, 20",
            "32.5kg 18, 35kg 20, 20, 20",
        ],
    },
    "pullB.closeGripPulldown": {
        "closeGripPulldownNeutral": [
            "75kg 12, 12, 12, 12, 12, 12, 12, 82.5kg 10, 10, 10, 10, 10, 90kg 9, 8",
            "82.5kg 11, 12, 11, 12, 12, 12, 9, 10, 10, 10, 12, 90kg 8, 8",
            "82.5kg 8, 8, 8, 10, 11, 8, 10, 9, 10, 8, 8, 9, 90kg 7, 8",
        ],
        "closeGripPulldownOverhand": [
            "82.5kg 12, 12, 12",
            "90kg 10, 10, 8",
            "90kg 8, 8, 8",
        ],
    },
    "pullB.highRow": {
        "highRow": [
            "50kg 10, 10, 10, 60kg 12, 12, 9, 10, 10, 10, 12, 65kg 9, 10, 10, 12, 12",
            "55kg 10, 10, 10, 60kg 12, 12, 9, 10, 10, 10, 12, 65kg 8, 10, 10, 12, 12",
            "60kg 10, 11, 11, 60kg 10, 10, 9, 9, 10, 10, 12, 65kg 8, 10, 12, 12, 12",
        ],
    },
    "pullB.seatedCableRow": {
        "seatedCableRow": [
            "80kg 10, 12, 12, 12, 95kg 10, 10, 10, 12, 12, 12, 12, 12, 10",
            "87.5kg 10, 12, 12, 12, 95kg 10, 10, 10, 12, 12, 12, 12, 9",
            "95kg 10, 11, 12, 12, 9, 10, 10, 10, 12, 10, 11, 9",
        ],
    },
    "pullB.tbarRow": {
        "tbarRow": [
            "60kg 12, 12, 11, 12, 12, 65kg 10, 10, 10, 11, 12, 8, 10, 9, 9",
            "60kg 12, 9, 8, 12, 65kg 11, 8, 9, 10, 10, 9, 8, 10, 9, 9",
            "60kg 11, 8, 7, 11, 60kg 9, 8, 8, 65kg 8, 8, 8",
        ],
    },
    "pullB.reverseFly": {
        "reverseMachineFly": [
            "50kg 12, 12, 12, 55kg 12, 60kg 12, 12, 12, 12, 12",
            "55kg 12, 12, 12, 60kg 12, 12, 12, 12, 12, 12",
            "65kg 9, 10, 55kg 12, 60kg 12, 10, 12, 12, 9",
        ],
        "singleArmRearFly": [
            "10kg 20, 20",
            "10kg 20, 20",
            "10kg 16, 17",
        ],
    },
    "pullB.preacherCurl": {
        "dbPreacher": [
            "15kg 11, 12, 12, 12, 15",
            "15kg 10, 10, 12, 12",
            "12.5kg 10, 12, 15kg 10, 10, 10",
        ],
        "armBlasterCurl": [
            "30kg 12, 35kg 12",
            "35kg 10, 12",
            "35kg 10, 12",
        ],
    },
    "pullB.hammerCurl": {
        "hammerCurl": [
            "15kg 10, 10, 12",
            "17.5kg 10, 14, 12",
        ],
    },
    "pullB.wristCurl": {
        "wristCurl": [
            "40kg 16, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20",
            "40kg 13, 17, 17, 20, 17, 17, 20, 14, 17, 15, 17",
            "40kg 14, 13, 13, 14, 14, 15, 14, 13, 15, 14, 14",
        ],
    },
    "pullB.reverseWristCurl": {
        "reverseWristCurl": [
            "17.5kg 13, 14, 16, 19, 17, 15, 18, 19, 19, 17, 14, 14",
            "17.5kg 12, 13, 13, 16, 15, 13, 15, 11, 11, 12, 12",
            "17.5kg 11, 11, 11, 14, 12, 13, 12, 9, 10, 10, 12",
        ],
    },

    # ---------------- LEGS B ----------------
    "legsB.seatedCalf": {
        "seatedCalf": [
            "40kg 20, 20, 20, 20, 20, 20, 60kg 20, 20, 20, 70kg 20, 80kg 20, 20, 20, 20, 20, 20, 20",
            "60kg 20, 20, 20, 20, 20, 20, 70kg 20, 20, 20, 20, 80kg 20, 20, 20, 20, 20, 20, 20",
            "80kg 15, 16, 18, 18, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20",
            "80kg 15, 16, 16, 18, 18, 13, 20, 20, 13, 16, 18, 20, 20, 20, 16, 20, 20",
        ],
    },
    "legsB.hipThrust": {
        "hipThrust": [
            "60kg 12, 12, 12, 12, 90kg 15, 15, 15, 15, 120kg 12, 12, 15",
            "90kg 12, 12, 12, 12, 12, 15, 15, 110kg 12, 120kg 12, 12, 12",
            "120kg 10, 10, 11, 90kg 12, 15, 15, 120kg 12, 12, 12, 13",
        ],
    },
    "legsB.abduction": {
        "abduction": [
            "50kg 12, 15, 20",
            "50kg 12, 15, 16",
            "60kg 12, 15, 17",
        ],
    },
    "legsB.barbellSquat": {
        "barbellSquat": [
            "100kg 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 120kg 10, 140kg 8, 8, 8",
            "140kg 10, 10, 10, 10, 9, 8, 8, 9, 6, 6, 5, 8, 8, 8, 8",
            "150kg 8, 9, 8, 9, 9, 6, 140kg 8, 8, 4, 120kg 8, 8, 10, 140kg 8, 8",
        ],
    },
    "legsB.hackSquat": {
        "hackSquat": [
            "80kg 10, 10, 10, 10, 10, 10, 12, 12, 12, 12, 120kg 10, 100kg 14, 14",
            "120kg 8, 9, 9, 12, 10, 10, 8, 10, 12, 10, 12, 8, 100kg 12, 12",
            "120kg 8, 9, 9, 10, 10, 10, 8, 10, 10, 6, 100kg 12, 12",
        ],
    },
    "legsB.legCurl": {
        "machineLegCurl": [
            "59kg 12, 12, 12, 12, 86kg 12, 100kg 10, 80kg 10",
            "82kg 12, 12, 86kg 12, 12, 100kg 10, 10",
            "100kg 7, 9, 11, 12, 10",
        ],
        "lyingLegCurl": [
            "102.5kg 10, 12",
            "110kg 10, 10, 10",
            "110kg 9, 9, 9",
        ],
    },
    "legsB.legExtension": {
        "legExtension": [
            "110kg 15, 15, 16, 14, 15, 15, 20, 17, 18, 19",
            "110kg 13, 16, 10, 15, 16, 15, 17",
        ],
    },

    # ---------------- ABS (shared by Push and Pull days) ----------------
    "abs.declineSitup": {
        "declineSitup": [
            "BW 12",
            "5kg 12",
            "15kg 12",
        ],
    },
    "abs.crunch": {
        "crunch": [
            "BW 12",
            "BW 12",
            "BW 10",
        ],
    },
    "abs.cableCrunch": {
        "cableCrunch": [
            "50kg 15, 60kg 15, 15, 16, 18",
            "55kg 15, 65kg 15, 15, 15, 13",
            "60kg 15, 70kg 11, 13, 15, 65kg 10",
        ],
    },
    "abs.legRaise": {
        # Push B entries (5 kg) then Pull B (7 kg, assumed most recent)
        "legRaise": [
            "5kg 12, 12, 7kg 12",
            "5kg 9, 11, 7kg 12",
            "5kg 9, 10, 7kg 12",
        ],
    },
}
