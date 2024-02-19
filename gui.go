package main

import (
	"fmt"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	"github.com/enescakir/emoji"
	"github.com/golang/glog"
	"github.com/sqweek/dialog"
	"os"
	"time"
)

func getExtractionMessage(p string) string {
	return fmt.Sprintf("extrcat to %s", p)
}

func isGui() bool {
	return len(os.Args) == 1
}

func gui() {

	var continueOnError bool

	a := app.New()
	w := a.NewWindow("RPA extractor")
	hello := widget.NewLabel("Choose RPA file and extraction directory!")

	var err error
	var rpaPath string
	var extraction = defaultExtractionPath

	var chooseRpa *widget.Button
	chooseRpa = widget.NewButton("Which file to extract?", func() {
		rpaPath, err = dialog.File().Filter("RPA files", "rpa").Title("Extract RPA").Save()
		if err != nil {
			glog.Exit(err)
		}
		chooseRpa.SetText(fmt.Sprintf("extract RPA %s", rpaPath))
	})

	var chooseExtract *widget.Button
	chooseExtract = widget.NewButton(getExtractionMessage(defaultExtractionPath), func() {
		extraction, err = dialog.Directory().Title("Where to extract").Browse()
		if err != nil {
			glog.Exit(err)
		}
		chooseExtract.SetText(getExtractionMessage(extraction))

	})

	ready := widget.NewLabel("")
	start := widget.NewButton("start", func() {
		var spinner = true
		go func() {
			for {
				e := []emoji.Emoji{emoji.Snail, emoji.Butterfly, emoji.Bug, emoji.Ant, emoji.Honeybee, emoji.Beetle, emoji.LadyBeetle, emoji.Cricket, emoji.Cockroach, emoji.Spider, emoji.SpiderWeb, emoji.Scorpion, emoji.Mosquito, emoji.Fly, emoji.Worm, emoji.Microbe}
				for i := range e {
					if !spinner {
						return
					}
					ready.SetText(e[i].String() + " processing")
					time.Sleep(time.Second / 2)
				}
			}
		}()
		run(rpaPath, extraction, continueOnError)
		spinner = false
		if err == nil {
			ready.SetText(emoji.CheckMark.String() + "Extracted")
		} else {
			ready.SetText(emoji.CrossMark.String() + "\t:\t" + err.Error())
		}

	})

	errorCheckbox := widget.NewCheck("Continue on error", func(b bool) {
		continueOnError = b
	})

	w.SetContent(container.NewVBox(
		hello,
		chooseRpa,
		chooseExtract,
		start,
		ready,
		errorCheckbox,
	))

	w.ShowAndRun()

}
